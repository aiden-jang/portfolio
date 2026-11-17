import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import manifest from '../../../data/globeGeometry.json';
import { vector, type GlobeEvent, type GlobePose } from './data';
import { createMarkers } from './markers';
import { lightSurface } from './surfaceMaterial';
import { ATMOSPHERE } from './surfaceLight';

export async function loadGeography(signal: AbortSignal) {
  const response = await fetch('/projects/globe-geography.bin.gz', { signal });
  if (!response.ok || !response.body) throw Error('Globe geography unavailable');
  const data = await response.arrayBuffer();
  const bytes = new Uint8Array(data);
  // Some hosts decode gzip before fetch exposes the body; others serve the stored bytes.
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return data;
  return new Response(
    new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip')),
  ).arrayBuffer();
}
export function createGlobeScene(
  canvas: HTMLCanvasElement,
  data: ArrayBuffer,
  events: GlobeEvent[],
  sun: Vector3,
) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearAlpha(0);
  const scene = new Scene(),
    camera = new PerspectiveCamera(32, 1, 0.1, 100),
    geometries: BufferGeometry[] = [],
    materials: (MeshBasicMaterial | LineBasicMaterial | ShaderMaterial)[] = [];
  const attribute = (name: Exclude<keyof typeof manifest, 'index'>) => {
    const a = manifest[name];
    return new BufferAttribute(new Float32Array(data, a.offset, a.count), 3);
  };
  const oceanGeometry = new SphereGeometry(1, 96, 64),
    oceanMaterial = new MeshBasicMaterial({ color: 0x102730, side: DoubleSide });
  const ocean = new Mesh(oceanGeometry, oceanMaterial);
  scene.add(ocean);
  geometries.push(oceanGeometry);
  materials.push(oceanMaterial);
  const landGeometry = new BufferGeometry();
  landGeometry.setAttribute('position', attribute('land'));
  landGeometry.setIndex(
    new BufferAttribute(new Uint32Array(data, manifest.index.offset, manifest.index.count), 1),
  );
  const landMaterial = new MeshBasicMaterial({
    color: 0x2d4b53,
    depthTest: false,
    depthWrite: false,
  });
  const land = new Mesh(landGeometry, landMaterial);
  land.renderOrder = 1;
  scene.add(land);
  geometries.push(landGeometry);
  materials.push(landMaterial);
  lightSurface(oceanMaterial, sun, { value: 0 }, true, { value: 1 });
  lightSurface(landMaterial, sun, { value: 0 }, false, { value: 1 });
  for (const [name, color, order] of [
    ['graticule', 0x1d3741, 0.5],
    ['plates', 0x92aeb4, 3],
    ['coast', 0x7297a0, 4],
  ] as const) {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', attribute(name));
    const material = new LineBasicMaterial({
      color,
      transparent: name === 'plates',
      opacity: name === 'plates' ? 0.9 : 1,
    });
    const object = new LineSegments(geometry, material);
    object.renderOrder = order;
    scene.add(object);
    geometries.push(geometry);
    materials.push(material);
  }
  const atmosphereGeometry = new SphereGeometry(1.3, 64, 48),
    atmosphereMaterial = new ShaderMaterial({
      ...ATMOSPHERE,
      uniforms: {
        uColor: { value: new Color(0x7896be) },
        uIntensity: { value: 0.3 },
        uOuter: { value: 1.22 },
        uSun: { value: sun },
      },
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
  scene.add(new Mesh(atmosphereGeometry, atmosphereMaterial));
  geometries.push(atmosphereGeometry);
  materials.push(atmosphereMaterial);
  const markers = createMarkers(events);
  scene.add(markers.object);
  let fit = 4,
    scale = 1;
  const resize = () => {
    const parent = canvas.parentElement!,
      width = parent.clientWidth,
      height = parent.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(devicePixelRatio, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    fit = 1 / (0.86 * Math.tan((16 * Math.PI) / 180)) / Math.min(1, camera.aspect);
    const radius = height / 2 / (fit * Math.tan((16 * Math.PI) / 180));
    scale = Math.max(0.45, Math.min(1, radius / 300));
    markers.resize(ratio, scale);
  };
  const render = (pose: GlobePose) => {
    camera.position.copy(vector(pose.lon, pose.lat, fit / pose.zoom));
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  };
  const project = (lon: number, lat: number) => {
    const point = vector(lon, lat);
    if (point.dot(camera.position.clone().sub(point)) <= 0) return null;
    const r = canvas.getBoundingClientRect();
    point.project(camera);
    return { x: r.left + ((point.x + 1) * r.width) / 2, y: r.top + ((1 - point.y) * r.height) / 2 };
  };
  resize();
  return {
    resize,
    render,
    project,
    scale: () => scale,
    dispose: () => {
      markers.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
