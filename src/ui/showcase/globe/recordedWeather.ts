import {
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  Mesh,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Texture,
  type Scene,
} from 'three';
import type { RecordedWeather } from './recordedWeatherAssets';
import { vector } from './data';

const vertex = `
varying vec3 vSurface;
varying float vTint;
attribute float aTint;
void main() {
  vSurface = position;
  vTint = aTint;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export function createRecordedWeather(scene: Scene, data: RecordedWeather) {
  const texture = new Texture(data.radar);
  texture.colorSpace = SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  const strength = { value: 1 };
  const sweep = { value: 0 };
  const radarGeometry = new SphereGeometry(1.002, 96, 64);
  const radarMaterial = new ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uRadar: { value: texture }, uStrength: strength, uSweep: sweep },
    vertexShader: vertex,
    fragmentShader: `
      uniform float uStrength;
      uniform float uSweep;
      uniform sampler2D uRadar;
      varying vec3 vSurface;
      void main() {
        vec3 n = normalize(vSurface);
        float latitude = clamp(n.y, -0.996273, 0.996273);
        float facing = dot(n, normalize(cameraPosition - vSurface));
        float u = atan(n.x, n.z) / 6.2831853 + 0.5;
        float v = 0.5 - 0.5 * log((1.0 + latitude) / (1.0 - latitude)) / 6.2831853;
        vec4 radar = texture2D(uRadar, vec2(u, v));
        float edge = smoothstep(0.02, 0.27, facing);
        float band = 1.0 - smoothstep(0.01, 0.24, abs(n.y - uSweep));
        gl_FragColor = vec4(radar.rgb, radar.a * edge * uStrength * (0.78 + band * 0.22));
        #include <colorspace_fragment>
      }`,
  });
  const radar = new Mesh(radarGeometry, radarMaterial);
  radar.renderOrder = 6;
  const positions: number[] = [];
  const tints: number[] = [];
  for (const [lon, lat, east, north] of data.wind) {
    const speed = Math.hypot(east, north);
    const length = Math.min(0.15, 4.1 / speed);
    const endLon = lon + (east * length) / Math.cos((lat * Math.PI) / 180);
    const endLat = lat + north * length;
    positions.push(
      ...vector(lon, lat, 1.004).toArray(),
      ...vector(endLon, endLat, 1.004).toArray(),
    );
    tints.push(0.06, Math.min(0.86, 0.4 + speed / 145));
  }
  const windGeometry = new BufferGeometry();
  windGeometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
  windGeometry.setAttribute('aTint', new BufferAttribute(new Float32Array(tints), 1));
  const windMaterial = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { uStrength: strength },
    vertexShader: vertex,
    fragmentShader: `
      uniform float uStrength;
      varying vec3 vSurface;
      varying float vTint;
      void main() {
        float facing = dot(normalize(vSurface), normalize(cameraPosition - vSurface));
        float alpha = smoothstep(0.08, 0.55, facing) * vTint * uStrength * 0.64;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(0.47, 0.72, 0.71, alpha);
      }`,
  });
  const wind = new LineSegments(windGeometry, windMaterial);
  wind.renderOrder = 7;
  scene.add(radar, wind);
  return {
    setSweep: (time: number) => {
      sweep.value = time > 0 ? (time % 12) / 6 - 1 : -2;
    },
    setStrength: (value: number) => {
      strength.value = value;
    },
    dispose: () => {
      texture.dispose();
      data.radar.close();
      radarGeometry.dispose();
      radarMaterial.dispose();
      windGeometry.dispose();
      windMaterial.dispose();
    },
  };
}
