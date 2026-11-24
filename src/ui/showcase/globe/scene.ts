import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  LineBasicMaterial,
  LineSegments,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  RedFormat,
  RepeatWrapping,
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
import type { RecordedWeather } from './recordedWeatherAssets';
import { createRecordedWeather } from './recordedWeather';

const AURORA_WIDTH = 180;
const AURORA_HEIGHT = 91;

export async function loadAurora(signal: AbortSignal) {
  const response = await fetch('/projects/globe-aurora.bin', { signal });
  if (!response.ok) throw Error('Recorded aurora unavailable');
  const data = await response.arrayBuffer();
  if (data.byteLength !== AURORA_WIDTH * AURORA_HEIGHT) throw Error('Invalid aurora grid');
  return new Uint8Array(data);
}

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
  featured: GlobeEvent,
  sun: Vector3,
  auroraGrid: Uint8Array<ArrayBuffer>,
  weather?: RecordedWeather,
) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: new URLSearchParams(location.search).has('poster'),
  });
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
  const aurora = new DataTexture(auroraGrid, AURORA_WIDTH, AURORA_HEIGHT, RedFormat);
  aurora.wrapS = RepeatWrapping;
  aurora.magFilter = aurora.minFilter = LinearFilter;
  aurora.needsUpdate = true;
  const terminatorStrength = weather ? 0.28 : 1;
  lightSurface(oceanMaterial, sun, { value: 0 }, true, { value: 1 }, aurora, terminatorStrength);
  lightSurface(landMaterial, sun, { value: 0 }, false, { value: 1 }, aurora, terminatorStrength);
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
  const overlays = weather ? createRecordedWeather(scene, weather) : undefined;
  const markers = createMarkers(events, false, !!weather);
  const featuredMarker = createMarkers([featured], true, !!weather);
  scene.add(markers.object, featuredMarker.object);
  const markerPositions = featuredMarker.object.geometry.getAttribute('position');
  const highlight = (event: GlobeEvent = featured) => {
    const position = vector(event.lon, event.lat, 1.006);
    markerPositions.setXYZ(0, position.x, position.y, position.z);
    markerPositions.needsUpdate = true;
  };
  let fit = 4;
  let frameWidth = 0;
  const resize = () => {
    const { clientWidth, clientHeight } = canvas.parentElement!;
    if (!clientWidth || !clientHeight) return;
    const mobile = clientWidth < clientHeight;
    // Scale the rendered frame and its still together, including coastlines and marker strokes.
    const width = mobile ? 390 : 1120;
    const height = mobile ? 440 : 732;
    if (frameWidth === width) return;
    frameWidth = width;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    if (width >= height)
      camera.setViewOffset(width, height, -width * 0.05, -height * 0.04, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    fit = 1 / (0.86 * Math.tan((16 * Math.PI) / 180)) / Math.min(1, camera.aspect);
    const radius = height / 2 / (fit * Math.tan((16 * Math.PI) / 180));
    const scale = Math.max(0.45, Math.min(1, radius / 300));
    markers.resize(scale);
    featuredMarker.resize(scale);
  };
  const render = (pose: GlobePose, journey = 0, pulseTime = 0) => {
    if (overlays) {
      const detail = Math.min(1, Math.max(0, (journey - 0.12) / 0.73));
      const strength = 1 - detail * detail * (3 - 2 * detail);
      overlays.setStrength(strength);
      markers.fade(strength);
      featuredMarker.pulse(pulseTime);
    }
    camera.position.copy(vector(pose.lon, pose.lat, fit / pose.zoom));
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
  };
  const project = (lon: number, lat: number, rect = canvas.getBoundingClientRect()) => {
    const point = vector(lon, lat);
    if (point.dot(camera.position.clone().sub(point)) <= 0) return null;
    point.project(camera);
    return {
      x: rect.left + ((point.x + 1) * rect.width) / 2,
      y: rect.top + ((1 - point.y) * rect.height) / 2,
    };
  };
  resize();
  return {
    resize,
    render,
    project,
    highlight,
    dispose: () => {
      overlays?.dispose();
      markers.dispose();
      featuredMarker.dispose();
      aurora.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}
