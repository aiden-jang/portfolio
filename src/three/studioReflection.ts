import * as THREE from 'three';
import { getStudioProjection, photoProjectionGlsl } from './studio/projection';
import { studioTexture } from './studio/textures';
import floorGlsl from './studio/floor.glsl?raw';

const varying = 'varying vec4 vUv; varying vec3 vFloorPosition;';

const roomUniforms = `
  uniform sampler2D studioConcrete;
  uniform float studioCarReady;
  uniform float closingFloor;
  uniform float studioDusk;
  uniform float garageStudioDim;
  uniform float garageStudioLow;
  uniform float garageStudioPass;
  uniform float garageStudioLamps;
  uniform float extendedLamp;
  uniform vec4 studioChassis;
  uniform vec2 studioWheelTouch[4];
  uniform vec3 studioPaint;
  uniform float studioSecondReady;
  uniform vec4 studioSecondChassis;
  uniform vec2 studioSecondTouch[4];
  ${photoProjectionGlsl}
`;

const plainFloorGlsl = `
  float fade = 1.0 - smoothstep(0.3, mix(3.1, 2.56, studioFinish), length(vFloorPosition.xz));
  float strength = mix(0.25, 0.17, studioFinish) * fade * reflectionStrength;
  gl_FragColor.rgb = mix(vec3(0.0035, 0.0035, 0.0045), gl_FragColor.rgb, strength);
`;

export function applyStudioReflection(
  material: THREE.ShaderMaterial,
  room: boolean,
  mobile: boolean,
) {
  material.uniforms.reflectionStrength = { value: 1 };
  material.uniforms.studioFinish = { value: 0 };
  if (room) {
    Object.assign(material.uniforms, getStudioProjection(mobile).uniforms, {
      studioConcrete: { value: studioTexture('floor.jpg').texture },
      studioWheelTouch: {
        value: Array.from({ length: 4 }, () => new THREE.Vector2()),
      },
      studioChassis: { value: new THREE.Vector4(0, 0, 1, 2) },
      studioCarReady: { value: 0 },
      closingFloor: { value: 0 },
      studioDusk: { value: 0 },
      garageStudioDim: { value: 0 },
      garageStudioLow: { value: 0 },
      garageStudioPass: { value: 0 },
      garageStudioLamps: { value: 0 },
      extendedLamp: { value: 0 },
      studioPaint: { value: new THREE.Color('#cf2428') },
      studioSecondReady: { value: 0 },
      studioSecondChassis: { value: new THREE.Vector4(0, 0, 1, 2) },
      studioSecondTouch: {
        value: Array.from({ length: 4 }, () => new THREE.Vector2()),
      },
    });
  }
  material.vertexShader = material.vertexShader.replace('varying vec4 vUv;', varying).replace(
    'vUv = textureMatrix * vec4( position, 1.0 );',
    `vUv = textureMatrix * vec4( position, 1.0 );
       vFloorPosition = (modelMatrix * vec4(position, 1.0)).xyz;`,
  );
  material.fragmentShader = material.fragmentShader
    .replace(
      'varying vec4 vUv;',
      varying +
        ' uniform float reflectionStrength; uniform float studioFinish;' +
        (room ? roomUniforms : ''),
    )
    .replace(
      '#include <tonemapping_fragment>',
      `${room ? floorGlsl : plainFloorGlsl}
       #include <tonemapping_fragment>`,
    );
}
