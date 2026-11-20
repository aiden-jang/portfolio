import { Mesh, MeshStandardMaterial, type Object3D } from 'three';

const wearFunctions = `
  varying vec3 wearSurface;
  uniform float roadUse;
  float rubberHash(vec3 p) { p=fract(p*.3183099+.1)*17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float pock(vec3 p) {
    vec3 i=floor(p),u=fract(p); u=u*u*(3.-2.*u);
    return mix(mix(mix(rubberHash(i),rubberHash(i+vec3(1,0,0)),u.x),
      mix(rubberHash(i+vec3(0,1,0)),rubberHash(i+vec3(1,1,0)),u.x),u.y),
      mix(mix(rubberHash(i+vec3(0,0,1)),rubberHash(i+vec3(1,0,1)),u.x),
      mix(rubberHash(i+vec3(0,1,1)),rubberHash(i+vec3(1,1,1)),u.x),u.y),u.z);
  }
  float raceMarks(vec3 p) {
    float side=smoothstep(.48,.80,abs(p.x));
    float lower=1.-smoothstep(.25,.72,p.y);
    float nose=smoothstep(1.52,2.14,p.z)*(1.-smoothstep(.53,.85,p.y));
    float flow=p.z-.26*(p.y-.25);
    float frontTrail=exp(-pow((flow-.54)/.56,2.));
    float rearTrail=exp(-pow((flow+1.79)/.47,2.));
    float wheelSpray=side*(frontTrail+rearTrail*.75);
    float grain=pock(p*vec3(26.,19.,6.));
    float flecks=smoothstep(.62,.80,pock(p*vec3(91.,112.,48.)));
    float rubber=smoothstep(.56,.83,pock(p*vec3(44.,140.,6.)));
    float band=lower*side*(.17+.45*wheelSpray)*grain;
    float transfer=(wheelSpray*lower+nose*.54)*(rubber*.65+flecks*.60);
    return clamp(band+transfer+max(nose,lower*wheelSpray)*grain*.18,0.,.88);
  }
`;

export function prepareRaceWear(model: Object3D) {
  const roadUse = { value: 0 };
  const touched = new Set<MeshStandardMaterial>();
  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    for (const item of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(item instanceof MeshStandardMaterial) || touched.has(item)) continue;
      const body = item.name === 'BODY';
      const rim = item.name === 'WHEELFRONT' || item.name === 'WHEELREAR';
      if (!body && !rim) continue;
      touched.add(item);
      const previous = item.onBeforeCompile.bind(item);
      item.customProgramCacheKey = () => 'corvette-wear-' + item.name;
      item.onBeforeCompile = (shader, gl) => {
        previous(shader, gl);
        shader.uniforms.roadUse = roadUse;
        shader.vertexShader =
          'varying vec3 wearSurface;\n' +
          shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\n wearSurface=(modelMatrix*vec4(transformed,1.)).xyz;',
          );
        shader.fragmentShader =
          wearFunctions +
          shader.fragmentShader
            .replace(
              '#include <color_fragment>',
              `
            #include <color_fragment>
            float dirtLevel = ${body ? 'raceMarks(wearSurface)' : '.30 + pock(wearSurface*48.)*.23'} * roadUse;
            vec3 roadDust = ${body ? 'vec3(.065,.052,.040)' : 'vec3(.062,.042,.028)'};
            diffuseColor.rgb = mix(diffuseColor.rgb,roadDust,dirtLevel);
          `,
            )
            .replace(
              '#include <roughnessmap_fragment>',
              `
            #include <roughnessmap_fragment>
            roughnessFactor = mix(roughnessFactor,.76,dirtLevel*.84);
          `,
            );
      };
    }
  });
  return (amount: number) => {
    roadUse.value = amount;
  };
}
