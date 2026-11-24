import * as THREE from 'three';

export function createEnvironmentBlend(
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number,
) {
  const target = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    colorSpace: THREE.LinearSRGBColorSpace,
    depthBuffer: false,
  });
  target.texture.mapping = THREE.CubeUVReflectionMapping;

  // Both PMREM atlases have the same layout, so each roughness level blends in linear light.
  const material = new THREE.ShaderMaterial({
    uniforms: { studio: { value: null }, evening: { value: null }, level: { value: 0 } },
    vertexShader: `
      varying vec2 atlasUv;
      void main() {
        atlasUv = uv;
        gl_Position = vec4(position.xy, 0., 1.);
      }`,
    fragmentShader: `
      varying vec2 atlasUv;
      uniform sampler2D studio;
      uniform sampler2D evening;
      uniform float level;
      void main() {
        gl_FragColor = mix(texture2D(studio, atlasUv), texture2D(evening, atlasUv), level);
      }`,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const geometry = new THREE.PlaneGeometry(2, 2);
  const plane = new THREE.Mesh(geometry, material);
  plane.frustumCulled = false;
  const scene = new THREE.Scene().add(plane);
  const camera = new THREE.Camera();
  return {
    mix(studio: THREE.Texture, evening: THREE.Texture, level: number) {
      if (
        material.uniforms.studio.value === studio &&
        material.uniforms.evening.value === evening &&
        material.uniforms.level.value === level
      )
        return target.texture;

      material.uniforms.studio.value = studio;
      material.uniforms.evening.value = evening;
      material.uniforms.level.value = level;
      const previous = renderer.getRenderTarget();
      const face = renderer.getActiveCubeFace();
      const mip = renderer.getActiveMipmapLevel();
      try {
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
      } finally {
        renderer.setRenderTarget(previous, face, mip);
      }
      return target.texture;
    },
    dispose() {
      target.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}
