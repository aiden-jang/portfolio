import { Mesh, MeshStandardMaterial, type Object3D } from 'three';
import { smoothTowards } from '../../math';
import { additionalAfterHoursLamps, type LampFloorProfile } from './afterHoursLampProfiles';
import { parkedLampMaterials, studioLensReflection } from './studioLampMaterials';
import { exteriorLampShaders } from './exteriorLampProfiles';
import type { Lamp } from '../../types';

export const afterHoursLampStyles: Partial<Record<string, LampFloorProfile>> = {
  ...additionalAfterHoursLamps,
  'ferrari-f120-f40.glb': { head: { spacing: 0.67, warmth: 0.46 }, tail: 0.67 },
  'corvette-c8r-tf-sport.glb': {
    head: { spacing: 0.84, warmth: 0 },
    tail: 0.84,
  },
  'mercedes-benz-w198-300-sl.glb': {
    head: { spacing: 0.76, warmth: 0.85 },
    tail: 0.76,
  },
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
  const shaders = lampMaterials[file] ?? additionalAfterHoursLamps[file]?.materials;
  const exterior = exteriorLampShaders[file];
  if (!shaders && !exterior) return null;
  const level = { value: 0 };
  const managed = { value: 0 };
  const masks = parkedLampMaterials[file];
  const visited = new Set<MeshStandardMaterial>();
  model.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
      if (!(material instanceof MeshStandardMaterial) || visited.has(material)) continue;
      const lens = shaders?.[material.name];
      const auxiliary = exterior?.[material.name];
      const mask = masks?.[material.name];
      const reflection = studioLensReflection[file]?.[material.name];
      if (!lens && !auxiliary && !mask && !reflection) continue;
      visited.add(material);
      const compile = material.onBeforeCompile.bind(material);
      const key = material.customProgramCacheKey();
      material.customProgramCacheKey = () =>
        key + ':after-hours-lamp:' + file + ':' + material.name;
      material.onBeforeCompile = (shader, renderer) => {
        compile(shader, renderer);
        shader.uniforms.lampLevel = level;
        shader.uniforms.managedLamps = managed;
        shader.vertexShader =
          'varying vec3 lampPosition;\n' +
          shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\nlampPosition = (modelMatrix * vec4(transformed,1.)).xyz;',
          );
        shader.fragmentShader =
          `
          uniform float lampLevel;
          uniform float managedLamps;
          varying vec3 lampPosition;
          float neutralLens(vec3 sampleColor) {
            float minChannel = min(min(sampleColor.r,sampleColor.g),sampleColor.b);
            return smoothstep(.025,.28,minChannel);
          }
          float redLens(vec3 sampleColor) {
            return smoothstep(.018,.20,sampleColor.r)
              * smoothstep(.075,.34,(sampleColor.r-sampleColor.g*1.85)/max(.06,sampleColor.r))
              * smoothstep(.04,.24,(sampleColor.r-sampleColor.b*1.6)/max(.06,sampleColor.r));
          }
          float amberLens(vec3 c) {
            float peak = max(.01,c.r);
            return smoothstep(.08,.36,peak)
              * smoothstep(.12,.34,c.g/peak)
              * (1.-smoothstep(.76,.96,c.g/peak))
              * (1.-smoothstep(.18,.43,c.b/peak))
              * smoothstep(.035,.15,c.g-c.b);
          }
        ` +
          shader.fragmentShader.replace(
            '#include <opaque_fragment>',
            `
          ${
            mask
              ? `
            float lensMask = managedLamps * (${mask});
            float sourcePeak = max(max(totalEmissiveRadiance.r,totalEmissiveRadiance.g),totalEmissiveRadiance.b);
            vec3 lensTexture = totalEmissiveRadiance / (.34+sourcePeak);
            outgoingLight = max(vec3(0.),outgoingLight - totalEmissiveRadiance*lensMask)
              + lensTexture*lensMask*mix(.103,.32,lampLevel);
          `
              : ''
          }
          ${reflection ? `outgoingLight *= 1.-managedLamps*(1.-lampLevel)*(${reflection});` : ''}
          if (lampLevel > .001) {
            float angle = abs(dot(normal,normalize(vViewPosition)));
            float lightView = lampLevel * mix(.24,1.,smoothstep(.09,.74,angle));
            float front = smoothstep(1.41,1.82,lampPosition.z);
            float back = smoothstep(1.56,1.94,-lampPosition.z);
            ${lens ? 'vec3 unlitColor = outgoingLight;' : ''}
            ${lens ?? ''}
            ${lens ? 'outgoingLight += .58 * max(vec3(0.),outgoingLight-unlitColor);' : ''}
            ${auxiliary ?? ''}
          }
          #include <opaque_fragment>
        `,
          );
      };
    }
  });
  return (active: boolean, dt: number, manageLamps = false) => {
    managed.value = Number(manageLamps);
    level.value = smoothTowards(level.value, Number(active), Math.min(1, dt * 9));
    return level.value;
  };
}

export function updateVehicleLights(
  lamps: readonly Lamp[],
  studio: boolean,
  followPreset: boolean,
  lampLevel: number,
  pulse: number,
) {
  const boost = 1 + pulse * 0.8;
  for (const { light, baseIntensity, isHeadlight } of lamps) {
    // The presets use fitted lens emission and floor spill. Generic points hit nearby bodywork.
    const scale = followPreset
      ? 0
      : isHeadlight
        ? 0.035 * (1 - lampLevel * 0.24)
        : 0.14 * (1 - lampLevel * 0.74);
    light.intensity = baseIntensity * boost * (studio ? scale : 1);
  }
}
