import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';
import { vector, type GlobeEvent } from './data';

export function createMarkers(events: GlobeEvent[], featured = false, dense = false) {
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
    uniforms: {
      uScale: { value: 1 },
      uFeatured: { value: featured },
      uDense: { value: dense },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
    },
    vertexShader: `
    attribute float aMagnitude;
    uniform float uScale;
    uniform bool uFeatured;
    uniform bool uDense;
    varying float vStrength;
    varying float vFacing;
    void main() {
      vec3 world = (modelMatrix * vec4(position, 1.0)).xyz;
      vFacing = dot(normalize(position), normalize(cameraPosition - world));
      float magnitude = clamp((aMagnitude - 1.0) / 6.5, 0.0, 1.0);
      vStrength = uDense ? smoothstep(0.56, 0.86, magnitude) : smoothstep(0.60, 0.94, magnitude);
      gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
      float denseSize = aMagnitude < 5.0 ? mix(5.4, 9.1, smoothstep(0.31, 0.62, magnitude))
        : mix(13.0, 19.5, smoothstep(0.61, 0.94, magnitude));
      float size = uFeatured ? (uDense ? 43.0 : 32.0) : uDense
        ? denseSize : mix(4.5, 8.5, smoothstep(0.60, 1.0, magnitude));
      gl_PointSize = size * uScale;
    }`,
    fragmentShader: `
    uniform bool uFeatured;
    uniform bool uDense;
    uniform float uOpacity;
    uniform float uTime;
    varying float vStrength;
    varying float vFacing;
    void main() {
      if (vFacing <= 0.0) discard;
      float dist = length(gl_PointCoord - vec2(0.5));
      if (uFeatured) {
        if (uDense) {
          float pulse = fract(uTime / 3.7);
          float core = 1.0 - smoothstep(0.097, 0.125, dist);
          float ring = 1.0 - smoothstep(0.012, 0.023, abs(dist - 0.20));
          float wave = 1.0 - smoothstep(0.012, 0.023, abs(dist - mix(0.20, 0.46, pulse)));
          gl_FragColor = vec4(vec3(1.0, 0.80, 0.53),
            (core + ring * 0.84 + wave * (1.0 - pulse) * 0.44) * smoothstep(0.02, 0.28, vFacing));
          return;
        }
        float core = 1.0 - smoothstep(0.125, 0.16, dist);
        float ring = 1.0 - smoothstep(0.009, 0.024, abs(dist - 0.41));
        float glow = (1.0 - smoothstep(0.12, 0.43, dist)) * 0.25;
        vec3 warm = mix(vec3(1.0, 0.62, 0.36), vec3(1.0, 0.86, 0.68), core);
        gl_FragColor = vec4(warm, (core + ring * 0.68 + glow) * smoothstep(0.0, 0.25, vFacing));
      } else {
        if (uDense) {
          float major = smoothstep(0.04, 0.38, vStrength);
          vec3 fill = mix(vec3(0.78, 0.50, 0.68), vec3(0.91, 0.38, 0.23), major);
          vec3 outline = mix(vec3(1.0, 0.77, 0.83), vec3(1.0, 0.77, 0.54), major);
          float halo = 1.0 - smoothstep(0.34, 0.49, dist);
          float core = 1.0 - smoothstep(0.32, 0.44, dist);
          float edge = smoothstep(0.22, 0.43, dist) * mix(0.13, 0.86, major);
          float alpha = (0.13 * halo + core * mix(0.58, 0.81, major))
            * smoothstep(0.02, 0.32, vFacing) * uOpacity;
          gl_FragColor = vec4(mix(fill, outline, edge), alpha);
          return;
        }
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
    fade: (strength: number) => {
      material.uniforms.uOpacity.value = strength;
    },
    pulse: (seconds: number) => {
      material.uniforms.uTime.value = seconds;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
