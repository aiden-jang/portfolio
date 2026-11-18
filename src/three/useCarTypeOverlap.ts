import type { RootState } from '@react-three/fiber';
import type { EffectComposer } from 'postprocessing';
import { useEffect, useRef } from 'react';
import {
  Box3,
  Color,
  Matrix4,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderTarget,
} from 'three';
import type { Object3D, WebGLRenderer } from 'three';
import { useAppStore } from '../store';
import { usePhotoMode } from '../ui/photo/state';
import { motionState } from './studioEntrance';

const desktop = '(min-width: 1100px) and (min-height: 600px) and (pointer: fine)';

function createOverlay(model: Object3D) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  canvas.className = 'car-type-overlap';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  document.body.append(canvas);

  const scene = new Scene();
  const silhouette = model.clone(true);
  const sourceParts: Object3D[] = [];
  const parts: [Object3D, Object3D][] = [];
  model.traverse((part) => sourceParts.push(part));
  silhouette.traverse((part) => {
    part.matrixAutoUpdate = false;
    parts.push([sourceParts[parts.length], part]);
  });
  scene.add(silhouette);
  const material = new MeshBasicMaterial();
  scene.overrideMaterial = material;
  return {
    canvas,
    context,
    scene,
    silhouette,
    parts,
    material,
    camera: new PerspectiveCamera(),
    target: new WebGLRenderTarget(1, 1, { samples: 4 }),
    clearColor: new Color(),
    pixels: new Uint8Array(0),
    matte: context.createImageData(1, 1),
    view: new Matrix4(),
    projection: new Matrix4(),
    covered: false,
  };
}

type Overlay = NonNullable<ReturnType<typeof createOverlay>>;

function syncSilhouette(overlay: Overlay) {
  let changed = false;
  for (const [source, part] of overlay.parts) {
    const matrix = part === overlay.silhouette ? source.matrixWorld : source.matrix;
    if (part.visible === source.visible && part.matrix.equals(matrix)) continue;
    part.visible = source.visible;
    part.matrix.copy(matrix);
    part.matrixWorldNeedsUpdate = true;
    changed = true;
  }
  return changed;
}

function titleCrop(
  box: Box3,
  bounds: DOMRect,
  camera: PerspectiveCamera,
  size: RootState['size'],
  lift: number,
  corner: Vector3,
) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (let i = 0; i < 8; i++) {
    corner.set(
      i & 1 ? box.max.x : box.min.x,
      i & 2 ? box.max.y : box.min.y,
      i & 4 ? box.max.z : box.min.z,
    );
    corner.project(camera);
    const x = ((corner.x + 1) * size.width) / 2;
    const y = ((1 - corner.y) * size.height) / 2 - lift;
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
  const x = Math.max(0, Math.floor(bounds.left), Math.floor(left) - 2);
  const y = Math.max(0, Math.floor(bounds.top), Math.floor(top) - 2);
  const width = Math.min(Math.floor(size.width), Math.ceil(bounds.right), Math.ceil(right) + 2) - x;
  const height =
    Math.min(Math.floor(size.height), Math.ceil(bounds.bottom), Math.ceil(bottom) + 2) - y;
  return { x, y, width, height };
}

function renderRaisedShot(
  camera: PerspectiveCamera,
  lift: number,
  composer: EffectComposer,
  dt: number,
) {
  const projection = camera.projectionMatrix;
  const centerY = projection.elements[9];
  // Reframe the rendered shot while keeping the camera used by the garage controls intact.
  projection.elements[9] -= lift;
  camera.projectionMatrixInverse.copy(projection).invert();
  try {
    composer.render(dt);
  } finally {
    projection.elements[9] = centerY;
    camera.projectionMatrixInverse.copy(projection).invert();
  }
}

function paintMatte(gl: WebGLRenderer, overlay: Overlay, width: number, height: number) {
  const { camera, context, target, scene, clearColor } = overlay;
  if (target.width !== width || target.height !== height) {
    target.setSize(width, height);
    overlay.canvas.width = width;
    overlay.canvas.height = height;
    overlay.pixels = new Uint8Array(width * height * 4);
    overlay.matte = context.createImageData(width, height);
  }
  const previousTarget = gl.getRenderTarget();
  const alpha = gl.getClearAlpha();
  gl.getClearColor(clearColor);
  try {
    gl.setClearColor(0, 0);
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.readRenderTargetPixels(target, 0, 0, width, height, overlay.pixels);
  } finally {
    gl.setRenderTarget(previousTarget);
    gl.setClearColor(clearColor, alpha);
  }

  // WebGL reads from the bottom. The matte only needs the car's coverage.
  const stride = width * 4;
  let covered = false;
  for (let row = 0; row < height; row++) {
    const input = (height - 1 - row) * stride;
    const output = row * stride;
    for (let channel = 3; channel < stride; channel += 4) {
      const alpha = overlay.pixels[input + channel];
      overlay.matte.data[output + channel] = alpha;
      covered ||= alpha !== 0;
    }
  }
  context.putImageData(overlay.matte, 0, 0);
  overlay.covered = covered;
}

export function useCarTypeOverlap() {
  const draw = useRef<(state: RootState, composer: EffectComposer, dt: number) => void>();
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('#sec-intro .garage-intro h1');
    if (!heading) return;
    const title = document.createRange();
    title.selectNodeContents(heading);
    const media = matchMedia(desktop);
    const box = new Box3();
    const corner = new Vector3();
    let overlay: Overlay | undefined;
    let source: Object3D | null = null;
    let unavailable = false;

    function clear() {
      if (!overlay) return;
      overlay.canvas.remove();
      overlay.target.dispose();
      overlay.material.dispose();
      overlay = undefined;
    }

    draw.current = ({ camera, gl, size }, composer, dt) => {
      const progress = motionState.openingOrbitProgress;
      const { sectionIndex, refs } = useAppStore.getState();
      const model = refs.carModel;
      if (
        !media.matches ||
        sectionIndex !== 0 ||
        unavailable ||
        !model ||
        !(camera instanceof PerspectiveCamera) ||
        gl.getContext().isContextLost() ||
        usePhotoMode.getState().active
      ) {
        clear();
        composer.render(dt);
        return;
      }
      if (source !== model) {
        clear();
        source = model;
        box.setFromObject(model);
      }

      const amount = Math.sin(Math.PI * progress) ** 2;
      const bounds = title.getBoundingClientRect();
      // Leave enough room for the wing to pass only the bottom of the letters.
      const clearance = size.height * 0.345 + 47 - bounds.bottom;
      const limit = Math.min(size.height * 0.094, 92);
      const lift = Math.max(-limit, Math.min(limit, clearance)) * amount;

      if (lift) renderRaisedShot(camera, (2 * lift) / size.height, composer, dt);
      else composer.render(dt);

      const { x, y, width, height } = titleCrop(box, bounds, camera, size, lift, corner);
      if (width <= 1 || height <= 1) {
        if (overlay) overlay.canvas.hidden = true;
        return;
      }

      overlay ??= createOverlay(model);
      if (!overlay) {
        unavailable = true;
        return;
      }
      const { canvas, context } = overlay;
      const modelChanged = syncSilhouette(overlay);
      overlay.camera.copy(camera);
      overlay.camera.setViewOffset(size.width, size.height, x, y + lift, width, height);
      // A settled pose can reuse the silhouette while the lit pixels update.
      if (
        modelChanged ||
        !overlay.view.equals(camera.matrixWorldInverse) ||
        !overlay.projection.equals(overlay.camera.projectionMatrix)
      ) {
        paintMatte(gl, overlay, width, height);
        overlay.view.copy(camera.matrixWorldInverse);
        overlay.projection.copy(overlay.camera.projectionMatrix);
      }
      canvas.hidden = !overlay.covered;
      if (!overlay.covered) return;

      const scaleX = gl.domElement.width / size.width;
      const scaleY = gl.domElement.height / size.height;
      // Reuse the composited frame so the wing keeps its lighting and color.
      context.globalCompositeOperation = 'source-in';
      context.drawImage(
        gl.domElement,
        x * scaleX,
        y * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        width,
        height,
      );
      context.globalCompositeOperation = 'source-over';
      canvas.style.transform = `translate(${x}px, ${y}px)`;
    };
    const unsubscribe = useAppStore.subscribe((state) => {
      if (state.sectionIndex !== 0) clear();
    });
    media.addEventListener('change', clear);
    return () => {
      media.removeEventListener('change', clear);
      unsubscribe();
      draw.current = undefined;
      clear();
    };
  }, []);
  return draw;
}
