import { Color, Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { finishStudyFrame } from '../finishStudy';

const clay = new Color('#9a9890');

export function addStudyMaterial(model: Object3D) {
  const amount = { value: 0 };
  const materials = new Set<MeshStandardMaterial>();
  model.traverse((part) => {
    if (!(part instanceof Mesh)) return;
    for (const material of Array.isArray(part.material) ? part.material : [part.material]) {
      if (material instanceof MeshStandardMaterial) materials.add(material);
    }
  });
  for (const material of materials) {
    const prepare = material.onBeforeCompile.bind(material);
    const cacheKey = material.customProgramCacheKey.bind(material);
    const key = cacheKey();
    material.customProgramCacheKey = () => key + '-finish-match';
    material.onBeforeCompile = (shader, renderer) => {
      prepare(shader, renderer);
      shader.uniforms.studyClay = amount;
      shader.uniforms.studyClayColor = { value: clay };
      shader.fragmentShader =
        'uniform float studyClay;\nuniform vec3 studyClayColor;\n' +
        shader.fragmentShader
          .replace(
            '#include <roughnessmap_fragment>',
            '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, .86, studyClay);',
          )
          .replace(
            '#include <metalnessmap_fragment>',
            '#include <metalnessmap_fragment>\nmetalnessFactor *= 1. - studyClay;\ndiffuseColor.rgb = mix(diffuseColor.rgb, studyClayColor, studyClay);',
          )
          .replace(
            '#include <lights_physical_fragment>',
            '#include <lights_physical_fragment>\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat *= 1. - studyClay;\n#endif',
          );
    };
  }
  return (active: boolean) => {
    const progress = Math.max(0, Math.min(1, (finishStudyFrame.progress - 0.38) / 0.37));
    amount.value = active ? 1 - progress * progress * (3 - 2 * progress) : 0;
  };
}
