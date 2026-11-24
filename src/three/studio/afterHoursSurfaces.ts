import { Mesh, MeshStandardMaterial, type Object3D } from 'three';

const carSurfaces = {
  'ferrari-f120-f40.glb': { paint: 'Metallic', glass: 'Translucent' },
  'corvette-c8r-tf-sport.glb': { paint: 'BODY', glass: 'GLASS' },
  'mercedes-benz-w198-300-sl.glb': { paint: 'main_color', glass: 'Material' },
} as const;

export function prepareAfterHoursSurfaces(model: Object3D, carFile: string) {
  const surface = carSurfaces[carFile as keyof typeof carSurfaces];
  if (!surface) return null;

  const evening = { value: 0 };
  const materials = new Set<MeshStandardMaterial>();
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(material instanceof MeshStandardMaterial) || materials.has(material)) continue;
      const glass = material.name === surface.glass;
      if (!glass && material.name !== surface.paint) continue;
      materials.add(material);

      const prepare = material.onBeforeCompile.bind(material);
      const cacheKey = material.customProgramCacheKey();
      material.customProgramCacheKey = () =>
        cacheKey + (glass ? ':evening-glass' : ':evening-hood');
      material.onBeforeCompile = (shader, renderer) => {
        prepare(shader, renderer);
        shader.uniforms.afterHoursSurface = evening;
        shader.vertexShader =
          'varying vec3 afterHoursPosition;\n' +
          shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\nafterHoursPosition = (modelMatrix * vec4(transformed, 1.)).xyz;',
          );
        shader.fragmentShader =
          `
          uniform float afterHoursSurface;
          varying vec3 afterHoursPosition;
        ` +
          shader.fragmentShader.replace(
            '#include <opaque_fragment>',
            `
          if (afterHoursSurface > .001) {
            ${
              glass
                ? `
              float glazing = smoothstep(.56,.76,afterHoursPosition.y)
                * (1.-smoothstep(.98,1.45,afterHoursPosition.z));
              float face = abs(dot(normal,normalize(vViewPosition)));
              float throughGlass = smoothstep(.20,.74,face);
              float windowWeight = glazing * throughGlass * afterHoursSurface;
              outgoingLight *= 1.-.60*windowWeight;
              diffuseColor.a *= 1.-.17*windowWeight;
            `
                : `
              float hood = (1.-smoothstep(.55,.79,abs(afterHoursPosition.x)))
                * smoothstep(.76,1.22,afterHoursPosition.z)
                * smoothstep(.33,.52,afterHoursPosition.y);
              vec3 specular = totalSpecular;
              #ifdef USE_CLEARCOAT
                specular += (clearcoatSpecularDirect + clearcoatSpecularIndirect) * material.clearcoat;
              #endif
              float warmPeak = min(min(specular.r,specular.g),specular.b);
              outgoingLight = max(vec3(0.),outgoingLight - .37*afterHoursSurface*hood*warmPeak);
            `
            }
          }
          #include <opaque_fragment>
        `,
          );
      };
    }
  });
  return evening;
}
