import type { ShaderMaterial } from 'three';
const varying = 'varying vec4 vUv; varying vec3 vFloorPosition;';

export function applyStudioReflection(material: ShaderMaterial) {
  material.vertexShader = material.vertexShader.replace('varying vec4 vUv;', varying).replace(
    'vUv = textureMatrix * vec4( position, 1.0 );',
    `vUv = textureMatrix * vec4( position, 1.0 );
       vFloorPosition = (modelMatrix * vec4(position, 1.0)).xyz;`,
  );
  material.fragmentShader = material.fragmentShader.replace('varying vec4 vUv;', varying).replace(
    '#include <tonemapping_fragment>',
    `float fade = 1.0 - smoothstep(0.3, 3.1, length(vFloorPosition.xz));
       gl_FragColor.rgb = mix(vec3(0.0035, 0.0035, 0.0045), gl_FragColor.rgb, 0.25 * fade);
       #include <tonemapping_fragment>`,
  );
}
