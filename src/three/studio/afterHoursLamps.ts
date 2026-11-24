import { Mesh, MeshStandardMaterial, type Object3D } from 'three';

export const afterHoursLampStyles: Record<string, { spacing: number; warmth: number }> = {
  'ferrari-f120-f40.glb': { spacing: 0.67, warmth: 0.46 },
  'corvette-c8r-tf-sport.glb': { spacing: 0.84, warmth: 0 },
  'mercedes-benz-w198-300-sl.glb': { spacing: 0.76, warmth: 0.85 },
};

const lampMaterials: Record<string, Record<string, string>> = {
  'ferrari-f120-f40.glb': {
    Translucent: `
      float raisedLens = smoothstep(.545,.578,lampPosition.y)
        * smoothstep(.47,.52,abs(lampPosition.x))
        * (1.-smoothstep(.82,.89,abs(lampPosition.x)));
      vec2 corePosition = vec2((abs(lampPosition.x)-.66)/.16,(lampPosition.y-.616)/.056);
      float core = exp(-dot(corePosition,corePosition));
      float panel = raisedLens * front * lightView;
      outgoingLight += vec3(1.35,1.06,.73) * panel * (.32 + .72*core);
    `,
    material_14: `
      float lens = smoothstep(.544,.586,lampPosition.y);
      float detail = smoothstep(.008,.20,dot(totalEmissiveRadiance,vec3(.2126,.7152,.0722)));
      outgoingLight += vec3(1.15,.88,.55) * lens * (.32 + .63*detail) * lightView * front;
    `,
    material_7: `
      float lens = redLens(totalEmissiveRadiance);
      outgoingLight += vec3(1.39,.025,.016) * lens * (.34 + 1.1 * totalEmissiveRadiance.r) * lightView;
    `,
  },
  'corvette-c8r-tf-sport.glb': {
    GLASS: `
      float optic = smoothstep(.025,.23,dot(totalEmissiveRadiance,vec3(.2126,.7152,.0722)));
      float strip = max(redLens(diffuseColor.rgb),optic*.50);
      outgoingLight += (vec3(.85,.94,1.18)*optic*2.5*front + vec3(1.48,.018,.008)*strip*back) * lightView;
    `,
  },
  'mercedes-benz-w198-300-sl.glb': {
    Material: `
      float glass = front * smoothstep(.16,.89,angle);
      outgoingLight += vec3(1.52,1.01,.52) * glass * lampLevel;
      diffuseColor.a = mix(diffuseColor.a,.78,glass*lampLevel);
    `,
    'Material.006': `
      float lens = redLens(diffuseColor.rgb);
      outgoingLight += vec3(1.58,.017,.007) * lens * (.55 + 1.4*diffuseColor.r) * lightView;
    `,
  },
};

export function prepareAfterHoursLamps(model: Object3D, file: string) {
  const shaders = lampMaterials[file];
  if (!shaders) return null;
  const level = { value: 0 };
  const visited = new Set<MeshStandardMaterial>();
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!(material instanceof MeshStandardMaterial) || visited.has(material)) continue;
      const lens = shaders[material.name];
      if (!lens) continue;
      visited.add(material);
      const compile = material.onBeforeCompile.bind(material);
      const key = material.customProgramCacheKey();
      material.customProgramCacheKey = () =>
        key + ':after-hours-lamp:' + file + ':' + material.name;
      material.onBeforeCompile = (shader, renderer) => {
        compile(shader, renderer);
        shader.uniforms.lampLevel = level;
        shader.vertexShader =
          'varying vec3 lampPosition;\n' +
          shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\nlampPosition = (modelMatrix * vec4(transformed,1.)).xyz;',
          );
        shader.fragmentShader =
          `
          uniform float lampLevel;
          varying vec3 lampPosition;
          float redLens(vec3 sampleColor) {
            return smoothstep(.018,.20,sampleColor.r)
              * smoothstep(.075,.34,(sampleColor.r-sampleColor.g*1.85)/max(.06,sampleColor.r))
              * smoothstep(.04,.24,(sampleColor.r-sampleColor.b*1.6)/max(.06,sampleColor.r));
          }
        ` +
          shader.fragmentShader.replace(
            '#include <opaque_fragment>',
            `
          if (lampLevel > .001) {
            float angle = abs(dot(normal,normalize(vViewPosition)));
            float lightView = lampLevel * mix(.24,1.,smoothstep(.09,.74,angle));
            float front = smoothstep(1.41,1.82,lampPosition.z);
            float back = smoothstep(1.56,1.94,-lampPosition.z);
            ${lens}
          }
          #include <opaque_fragment>
        `,
          );
      };
    }
  });
  return level;
}
