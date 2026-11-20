import * as THREE from 'three';
import { ferrariDetailShader } from './ferrariDetailShaders';
import { studioSurfaces } from './ferrariSurfaces';
import type { getStudioProjection } from './projection';

type Surface = THREE.MeshStandardMaterial & Partial<THREE.MeshPhysicalMaterial>;

export function tuneStudioFerrari(model: THREE.Object3D) {
  const studio = { value: 0 };
  const optics = { value: 0 };
  const fixtureBasis = { value: new THREE.Matrix4() };
  const fixtureX = { value: 0 };
  const materials = new Set<Surface>();
  const updates: ((active: boolean) => void)[] = [];
  model.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return;
    for (const item of Array.isArray(part.material) ? part.material : [part.material]) {
      const material = item as Surface;
      const tune = studioSurfaces[material.name];
      if (
        !material.isMeshStandardMaterial ||
        !Object.hasOwn(studioSurfaces, material.name) ||
        materials.has(material)
      )
        continue;
      materials.add(material);

      const tuning = {
        metalness: tune.metalness,
        roughness: tune.roughness,
        clearcoat: tune.coat,
        clearcoatRoughness: tune.coatRoughness,
        specularIntensity: tune.spec,
        emissiveIntensity: tune.emissiveIntensity,
      };
      const changes = Object.entries(tuning)
        .filter(
          ([key, value]) =>
            value !== undefined && typeof material[key as keyof Surface] === 'number',
        )
        .map(([key, value]) => {
          const property = key as keyof typeof tuning;
          return { property, original: material[property]!, value: value! };
        });
      updates.push((active) => {
        for (const change of changes)
          material[change.property] = active ? change.value : change.original;
        material.needsUpdate = true;
      });

      const isBody = material.name === 'Metallic';
      const isGlass = material.name === 'Translucent';
      const isFabric = material.name === 'Fabric_-_Red';
      const detail = ferrariDetailShader(material.name);
      if (!tune.tone && !isBody && !isGlass && !detail) continue;
      const prepare = material.onBeforeCompile.bind(material);
      const color = new THREE.Vector3(...(tune.tone ?? [1, 1, 1]));
      material.customProgramCacheKey = () => 'studio-f40-' + material.name;
      material.onBeforeCompile = (program, renderer) => {
        prepare(program, renderer);
        program.uniforms.photoMaterial = studio;
        program.uniforms.opticalFinish = optics;
        program.uniforms.photoTone = { value: color };
        program.uniforms.fixtureBasis = fixtureBasis;
        program.uniforms.fixtureX = fixtureX;
        program.vertexShader =
          'varying vec3 worldCarSurface;\n' +
          program.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\nworldCarSurface = (modelMatrix * vec4(transformed, 1.)).xyz;',
          );
        program.fragmentShader =
          `
          uniform float photoMaterial;
          uniform float opticalFinish;
          uniform vec3 photoTone;
          uniform mat4 fixtureBasis;
          uniform float fixtureX;
          varying vec3 worldCarSurface;
          ${detail?.declarations ?? ''}
          vec3 reflectedCornerLight(vec3 surface, vec3 eye, vec3 surfaceNormal, float softness) {
            if (photoMaterial<=.001) return vec3(0.);
            vec3 p=(fixtureBasis*vec4(surface,1.)).xyz;
            vec3 r=mat3(fixtureBasis)*reflect(-eye,surfaceNormal);
            vec2 corner=vec2(fixtureX-.0275,.0275);
            vec2 inward=vec2(-.707107,.707107);
            float approach=-dot(inward,r.xz);
            float depth=dot(inward,p.xz-corner);
            if (approach<=.003 || depth<=0.) return vec3(0.);
            float travel=depth/approach;
            vec3 hit=p+r*travel;
            float side=dot(hit.xz-corner,vec2(.707107,.707107));
            float spread=softness+.008*clamp(travel,0.,16.);
            float height=smoothstep(.12,.31,hit.y)*(1.-smoothstep(2.62,2.83,hit.y));
            float line=exp(-pow(abs(side)/spread,2.))*height;
            line*=smoothstep(.035,.22,approach)*smoothstep(.15,1.,travel);
            float fresnel=.075+.925*pow(1.-clamp(abs(dot(eye,surfaceNormal)),0.,1.),4.);
            return vec3(1.,.76,.51)*line*(.49+fresnel*.91)/(1.+travel*.052);
          }
        ` +
          program.fragmentShader
            .replace(
              '#include <color_fragment>',
              `
            #include <color_fragment>
            diffuseColor.rgb *= mix(vec3(1.), photoTone, photoMaterial);
            ${detail?.color ?? ''}
            ${
              isBody
                ? `
              float sill = smoothstep(.12, .53, worldCarSurface.y);
              float side = smoothstep(.48, .98, abs(worldCarSurface.x));
              diffuseColor.rgb *= mix(1., mix(.69 + .14 * side, 1., sill), photoMaterial);
            `
                : ''
            }
            ${
              isFabric
                ? `
              vec3 fabricGrain = sin(worldCarSurface * vec3(887.0, 689.0, 781.0));
              float thread = fabricGrain.x * fabricGrain.y * fabricGrain.z;
              diffuseColor.rgb *= 1.0 + thread * .045 * photoMaterial;
            `
                : ''
            }
          `,
            )
            .replace(
              '#include <lights_physical_fragment>',
              `
            #include <lights_physical_fragment>
            ${detail?.physical ?? ''}
            ${
              isBody
                ? `
              float hoodCenter = 1.0 - smoothstep(.52,.83,abs(worldCarSurface.x));
              float hoodLength = smoothstep(.845,1.16,worldCarSurface.z)
                * (1.0 - smoothstep(1.91,2.185,worldCarSurface.z));
              float hoodHeight = smoothstep(.37,.46,worldCarSurface.y);
              float hoodFinish = photoMaterial * hoodCenter * hoodLength * hoodHeight;
              material.roughness = mix(material.roughness,.31,hoodFinish);
              float doorScope = smoothstep(.69,.94,abs(worldCarSurface.x))*
                smoothstep(.30,.54,worldCarSurface.y)*(1.-smoothstep(.71,.89,worldCarSurface.y));
              float deckScope = smoothstep(.85,1.49,-worldCarSurface.z)*
                smoothstep(.58,.87,worldCarSurface.y);
              material.roughness = mix(material.roughness,.186,photoMaterial*max(deckScope,doorScope*.67));
              material.roughness = mix(material.roughness, .327, opticalFinish);
              #ifdef USE_CLEARCOAT
                material.clearcoatRoughness = mix(material.clearcoatRoughness,.235,hoodFinish);
                material.clearcoatRoughness = mix(material.clearcoatRoughness,.083,
                  photoMaterial*max(deckScope,doorScope*.54));
                material.clearcoatRoughness = mix(material.clearcoatRoughness,.076, opticalFinish);
              #endif
            `
                : ''
            }
          `,
            )
            .replace(
              '#include <opaque_fragment>',
              `
            ${
              isBody
                ? `
              vec3 hoodSpecular = totalSpecular;
              #ifdef USE_CLEARCOAT
                hoodSpecular += (clearcoatSpecularDirect + clearcoatSpecularIndirect) * material.clearcoat;
              #endif
              float bloomOnPaint = min(min(hoodSpecular.r,hoodSpecular.g),hoodSpecular.b);
              float roofProtection = smoothstep(.89, 1.13, worldCarSurface.y);
              outgoingLight -= vec3(bloomOnPaint) * (.54 * hoodFinish + opticalFinish*(.18 + .23*roofProtection));
              outgoingLight = max(vec3(0.),outgoingLight);

              vec3 worldView = normalize(cameraPosition - worldCarSurface);
              vec3 worldNormal = inverseTransformDirection(normal, viewMatrix);
              vec3 cornerReflection = reflectedCornerLight(worldCarSurface,worldView,worldNormal,.024);
              float coatEnergy = .81 - .33*hoodFinish;
              outgoingLight += cornerReflection * coatEnergy * photoMaterial;
            `
                : ''
            }
            ${
              isGlass
                ? `
              vec3 toCamera = normalize(vViewPosition);
              vec3 worldEye = normalize(cameraPosition-worldCarSurface);
              vec3 glassNormal = inverseTransformDirection(normal,viewMatrix);
              float faceAngle = abs(dot(normal,toCamera));
              float edgeReflection = .057 + .943 * pow(clamp(1.-faceAngle,0.,1.),4.5);
              float cabinGlazing = 1.-smoothstep(1.03,1.47,worldCarSurface.z);
              float windshield = smoothstep(.39,.87,abs(glassNormal.z));
              float edgeTint = 1.-smoothstep(.68,.94,worldCarSurface.y);
              float glassOpacity = mix(.51,.39,windshield) + .36*edgeReflection + .045*edgeTint;
              float downLook = smoothstep(.15,.44,worldEye.y);
              float rearDeck = smoothstep(.45,1.29,-worldCarSurface.z);
              glassOpacity -= .080*downLook*(1.-edgeReflection)*(1.-rearDeck*.25);
              vec3 surfaceTint = mix(vec3(.015,.020,.023),vec3(.020,.028,.034),windshield);
              vec3 filteredReflection = (reflectedLight.directSpecular + reflectedLight.indirectSpecular)
                * mix(.55,.82,windshield);
              vec3 glazingSpecular = reflectedCornerLight(worldCarSurface,worldEye,glassNormal,.013)
                * mix(.88,1.19,edgeReflection);
              float clearView = (1.-smoothstep(.13,.90,edgeReflection))*opticalFinish;
              glassOpacity = mix(glassOpacity, max(.17, glassOpacity-.19), clearView);
              glazingSpecular *= 1. + opticalFinish*.33;
              vec3 glassColor = surfaceTint*(1.-.21*edgeTint)
                + (filteredReflection + glazingSpecular)/max(.39,glassOpacity);
              outgoingLight = mix(outgoingLight,glassColor,photoMaterial*cabinGlazing);
              diffuseColor.a = mix(diffuseColor.a,glassOpacity,photoMaterial*cabinGlazing);
            `
                : ''
            }
            ${detail?.outgoing ?? ''}
            #include <opaque_fragment>
          `,
            );
      };
    }
  });
  let active = false;
  return (next: boolean, room?: ReturnType<typeof getStudioProjection>, refined = false) => {
    optics.value = Number(next && refined);
    if (room) {
      fixtureBasis.value = room.uniforms.studioRoomBasis.value;
      fixtureX.value = room.uniforms.studioLightBarX.value;
    }
    if (next === active) return;
    active = next;
    studio.value = active ? 1 : 0;
    for (const update of updates) update(active);
  };
}
