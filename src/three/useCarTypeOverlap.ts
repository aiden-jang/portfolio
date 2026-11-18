import type { RootState } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Color, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderTarget } from 'three';
import type { Object3D, WebGLRenderer } from 'three';
import { useAppStore } from '../store';
import { usePhotoMode } from '../ui/photo/state';
import { motionState } from './studioEntrance';

const desktop =
  '(min-width: 1100px) and (min-height: 600px) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

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
  silhouette.matrixAutoUpdate = false;
  scene.add(silhouette);
  const material = new MeshBasicMaterial();
  scene.overrideMaterial = material;
  return {
    canvas,
    context,
    scene,
    silhouette,
    material,
    camera: new PerspectiveCamera(),
    target: new WebGLRenderTarget(1, 1, { samples: 4 }),
    clearColor: new Color(),
    pixels: new Uint8Array(0),
    matte: context.createImageData(1, 1),
  };
}

type Overlay = NonNullable<ReturnType<typeof createOverlay>>;

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
  for (let row = 0; row < height; row++) {
    const input = (height - 1 - row) * stride;
    const output = row * stride;
    for (let channel = 3; channel < stride; channel += 4) {
      overlay.matte.data[output + channel] = overlay.pixels[input + channel];
    }
  }
  context.putImageData(overlay.matte, 0, 0);
}

export function useCarTypeOverlap() {
  const draw = useRef<(state: RootState) => void>();
  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('#sec-intro .garage-intro h1');
    const panel = heading?.parentElement;
    if (!panel || !heading) return;
    const title = document.createRange();
    title.selectNodeContents(heading);
    const media = matchMedia(desktop);
    let overlay: Overlay | undefined;
    let shift = 0;
    let unavailable = false;

    function clear() {
      if (shift) panel!.style.removeProperty('--car-type-shift');
      shift = 0;
      if (!overlay) return;
      overlay.canvas.remove();
      overlay.target.dispose();
      overlay.material.dispose();
      overlay = undefined;
    }

    function clearOnScroll() {
      if ((shift || overlay) && window.scrollY > 0) clear();
    }

    draw.current = ({ camera, gl, size }) => {
      const progress = motionState.openingOrbitProgress;
      if (
        !progress ||
        !media.matches ||
        unavailable ||
        window.scrollY > 0 ||
        !(camera instanceof PerspectiveCamera) ||
        usePhotoMode.getState().active
      ) {
        clear();
        return;
      }
      const model = useAppStore.getState().refs.carModel;
      if (!model || gl.getContext().isContextLost()) {
        clear();
        return;
      }

      const amount = Math.sin(Math.PI * progress) ** 2;
      const bounds = title.getBoundingClientRect();
      const restingBottom = bounds.bottom - shift;
      // On short windows the title can start below the wing, so it may need to rise.
      const clearance = size.height * 0.345 + 47 - restingBottom;
      const limit = Math.min(size.height * 0.094, 92);
      const nextShift = Math.max(-limit, Math.min(limit, clearance)) * amount;
      // Keep the foreground pass inside the title's lower right corner.
      const top = restingBottom - bounds.height * 0.28 + nextShift;
      if (nextShift) panel.style.setProperty('--car-type-shift', `0 ${nextShift}px`);
      else if (shift) panel.style.removeProperty('--car-type-shift');
      shift = nextShift;
      if (amount < 0.32) {
        if (overlay) overlay.canvas.hidden = true;
        return;
      }

      const x = Math.max(0, Math.floor(bounds.left + bounds.width * 0.58));
      const y = Math.max(0, Math.floor(top));
      const width = Math.min(Math.floor(size.width) - x, Math.ceil(bounds.width * 0.42));
      const height = Math.min(Math.floor(size.height) - y, Math.ceil(bounds.height * 0.28) + 1);
      if (width <= 1 || height <= 1) {
        if (overlay) overlay.canvas.hidden = true;
        return;
      }

      overlay ??= createOverlay(model);
      if (!overlay) {
        unavailable = true;
        clear();
        return;
      }
      const { canvas, context } = overlay;
      overlay.silhouette.matrix.copy(model.matrixWorld);
      overlay.camera.copy(camera);
      overlay.camera.setViewOffset(size.width, size.height, x, y, width, height);
      paintMatte(gl, overlay, width, height);

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
      canvas.style.opacity = String(Math.min(1, (amount - 0.32) / 0.2));
      canvas.hidden = false;
    };
    media.addEventListener('change', clear);
    window.addEventListener('scroll', clearOnScroll, { passive: true });
    return () => {
      media.removeEventListener('change', clear);
      window.removeEventListener('scroll', clearOnScroll);
      draw.current = undefined;
      clear();
    };
  }, []);
  return draw;
}
