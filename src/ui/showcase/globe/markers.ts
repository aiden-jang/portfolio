import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';
import { vector, type GlobeEvent } from './data';

export function createMarkers(events: GlobeEvent[], featured = false) {
  const positions = new Float32Array(events.length * 3),
    mags = new Float32Array(events.length);
  events.forEach((event, i) => {
    vector(event.lon, event.lat, 1.006).toArray(positions, i * 3);
    mags[i] = event.magnitude;
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aMagnitude', new BufferAttribute(mags, 1));
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { uScale: { value: 1 }, uFeatured: { value: featured } },
    vertexShader: `
    attribute float aMagnitude;
    uniform float uScale;
    uniform bool uFeatured;
    varying float vStrength;
    varying float vFacing;
    void main() {
      vec3 world = (modelMatrix * vec4(position, 1.0)).xyz;
      vFacing = dot(normalize(position), normalize(cameraPosition - world));
      float magnitude = clamp((aMagnitude - 1.0) / 6.5, 0.0, 1.0);
      vStrength = smoothstep(0.60, 0.94, magnitude);
      gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
      float size = uFeatured ? 32.0 : mix(4.5, 8.5, smoothstep(0.60, 1.0, magnitude));
      gl_PointSize = size * uScale;
    }`,
    fragmentShader: `
    uniform bool uFeatured;
    varying float vStrength;
    varying float vFacing;
    void main() {
      if (vFacing <= 0.0) discard;
      float dist = length(gl_PointCoord - vec2(0.5));
      if (uFeatured) {
        float core = 1.0 - smoothstep(0.125, 0.16, dist);
        float ring = 1.0 - smoothstep(0.009, 0.024, abs(dist - 0.41));
        float glow = (1.0 - smoothstep(0.12, 0.43, dist)) * 0.25;
        vec3 warm = mix(vec3(1.0, 0.62, 0.36), vec3(1.0, 0.86, 0.68), core);
        gl_FragColor = vec4(warm, (core + ring * 0.68 + glow) * smoothstep(0.0, 0.25, vFacing));
      } else {
        float dotAlpha = 1.0 - smoothstep(0.28, 0.47, dist);
        vec3 color = mix(vec3(0.74, 0.57, 0.44), vec3(0.98, 0.73, 0.50), vStrength);
        gl_FragColor = vec4(color, dotAlpha * mix(0.60, 0.78, vStrength) * smoothstep(0.0, 0.24, vFacing));
      }
    }`,
  });
  const object = new Points(geometry, material);
  object.renderOrder = featured ? 11 : 10;
  object.frustumCulled = false;
  return {
    object,
    resize: (scale: number) => {
      material.uniforms.uScale.value = scale;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
