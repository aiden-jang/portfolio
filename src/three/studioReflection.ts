import type { ShaderMaterial } from 'three';
const varying = 'varying vec4 vUv; varying vec3 vFloorPosition;';

export function applyStudioReflection(material: ShaderMaterial) {
  material.uniforms.reflectionStrength = { value: 1 };
  material.uniforms.studioFinish = { value: 0 };
  material.vertexShader = material.vertexShader.replace('varying vec4 vUv;', varying).replace(
    'vUv = textureMatrix * vec4( position, 1.0 );',
    `vUv = textureMatrix * vec4( position, 1.0 );
       vFloorPosition = (modelMatrix * vec4(position, 1.0)).xyz;`,
  );
  material.fragmentShader = material.fragmentShader
    .replace(
      'varying vec4 vUv;',
      varying + ' uniform float reflectionStrength; uniform float studioFinish;',
    )
    .replace(
      '#include <tonemapping_fragment>',
      `float fade = 1.0 - smoothstep(0.3, mix(3.1, 2.56, studioFinish), length(vFloorPosition.xz));
       float strength = mix(0.25, 0.17, studioFinish) * fade * reflectionStrength;
       gl_FragColor.rgb = mix(vec3(0.0035, 0.0035, 0.0045), gl_FragColor.rgb, strength);
       #include <tonemapping_fragment>`,
    );
}
