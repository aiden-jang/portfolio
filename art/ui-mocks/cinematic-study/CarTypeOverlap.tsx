import type { RootState } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import type { Object3D } from 'three';
import { KEYFRAMES } from '../../../src/config';
import { useAppStore } from '../../../src/store';

const desktop =
  '(min-width: 1100px) and (min-height: 660px) and (prefers-reduced-motion: no-preference)';
const sweep = (26 * Math.PI) / 180;

function createOverlay() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearAlpha(0);
  canvas.className = 'car-type-overlap';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.hidden = true;
  document.body.append(canvas);
  const scene = new Scene();
  const material = new MeshBasicMaterial();
  scene.overrideMaterial = material;
  return { canvas, context, renderer, scene, material, camera: new PerspectiveCamera() };
}

export function useCarTypeOverlap() {
  const overlay = useRef<ReturnType<typeof createOverlay>>();
  const source = useRef<Object3D>();
  const silhouette = useRef<Object3D>();
  const intro = useRef<HTMLElement>();
  const title = useRef<Range>();
  const query = useRef<MediaQueryList>();
  const failed = useRef(false);
  const moving = useRef(false);

  useEffect(() => {
    const heading = document.querySelector<HTMLElement>('.garage-intro h1');
    if (!heading?.parentElement) return;
    const panel = heading.parentElement;
    const range = document.createRange();
    range.selectNodeContents(heading);
    intro.current = panel;
    title.current = range;
    query.current = matchMedia(desktop);
    function reset() {
      panel.style.removeProperty('--car-type-shift');
      if (overlay.current) overlay.current.canvas.hidden = true;
      moving.current = false;
    }
    const media = query.current;
    media.addEventListener('change', reset);
    return () => {
      media.removeEventListener('change', reset);
      reset();
      const current = overlay.current;
      current?.canvas.remove();
      current?.material.dispose();
      current?.renderer.dispose();
      current?.renderer.forceContextLoss();
      overlay.current = undefined;
      source.current = undefined;
      silhouette.current = undefined;
    };
  }, []);

  return ({ camera, gl, size }: RootState) => {
    const panel = intro.current;
    const range = title.current;
    const model = useAppStore.getState().refs.carModel;
    if (
      !query.current?.matches ||
      !panel ||
      !range ||
      !model ||
      failed.current ||
      !(camera instanceof PerspectiveCamera) ||
      document.documentElement.dataset.openingOrbit !== 'playing'
    ) {
      if (moving.current) {
        panel?.style.removeProperty('--car-type-shift');
        if (overlay.current) overlay.current.canvas.hidden = true;
        moving.current = false;
      }
      return;
    }

    const azimuth = Math.atan2(camera.position.x, camera.position.z);
    const progress = 1 - (KEYFRAMES[0].azimuth - azimuth) / sweep;
    const amount = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, progress))), 2);
    panel.style.setProperty('--car-type-shift', `${Math.min(size.height * 0.094, 92) * amount}px`);
    moving.current = true;
    if (amount < 0.32) {
      if (overlay.current) overlay.current.canvas.hidden = true;
      return;
    }

    try {
      overlay.current ??= createOverlay();
    } catch {
      failed.current = true;
      return;
    }
    const current = overlay.current;
    if (!current) return;
    if (source.current !== model || !silhouette.current) {
      current.scene.clear();
      silhouette.current = model.clone(true);
      silhouette.current.matrixAutoUpdate = false;
      current.scene.add(silhouette.current);
      source.current = model;
    }
    silhouette.current.matrix.copy(model.matrixWorld);

    // Crop to the right-hand descenders. Use the actual frame for the finish and the model for alpha.
    const bounds = range.getBoundingClientRect();
    const x = Math.max(0, Math.floor(bounds.left + bounds.width * 0.58));
    const y = Math.max(0, Math.floor(bounds.bottom - bounds.height * 0.28));
    const width = Math.min(size.width, Math.ceil(bounds.right)) - x;
    const height = Math.min(size.height, Math.ceil(bounds.bottom)) - y;
    if (width <= 0 || height <= 0) {
      current.canvas.hidden = true;
      return;
    }
    const { canvas, context, renderer } = current;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      renderer.setSize(width, height, false);
    }
    current.camera.copy(camera);
    current.camera.setViewOffset(size.width, size.height, x, y, width, height);
    renderer.render(current.scene, current.camera);

    const pixelWidth = gl.domElement.width / size.width;
    const pixelHeight = gl.domElement.height / size.height;
    context.clearRect(0, 0, width, height);
    context.drawImage(renderer.domElement, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.drawImage(
      gl.domElement,
      x * pixelWidth,
      y * pixelHeight,
      width * pixelWidth,
      height * pixelHeight,
      0,
      0,
      width,
      height,
    );
    context.globalCompositeOperation = 'source-over';
    canvas.style.transform = `translate(${x}px, ${y}px)`;
    canvas.hidden = false;
  };
}
