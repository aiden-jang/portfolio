const wheelCoordinates = /* glsl */ `
  vec2 wheelOffset(vec3 p) {
    return vec2(p.y-(p.z>0.? .326 : .347), p.z-(p.z>0.? 1.166 : -1.337));
  }
  float fineRing(float radius, float density) {
    float phase = radius*density;
    return cos(phase)*(1.-smoothstep(.75,3.2,fwidth(phase)));
  }
`;

function wheelFinish(tire: boolean) {
  return {
    declarations: wheelCoordinates,
    color: /* glsl */ `
      float wheelRadius = length(wheelOffset(worldCarSurface));
      float wheelFace = smoothstep(.69,.81,abs(worldCarSurface.x))
        * (1.-smoothstep(.325,.365,wheelRadius));
      float turnedMarks = fineRing(wheelRadius,1150.);
      ${
        tire
          ? `
        float edgeBead = exp(-pow((wheelRadius-.299)*143.,2.))
          + .46*exp(-pow((wheelRadius-.319)*138.,2.));
        diffuseColor.rgb *= 1.+photoMaterial*wheelFace*(edgeBead*.16+turnedMarks*.045);
      `
          : `
        float wheelLip = smoothstep(.209,.274,wheelRadius);
        diffuseColor.rgb *= 1.+photoMaterial*wheelFace*
          (.19*wheelLip + .09*turnedMarks*mix(.53,1.,wheelLip));
      `
      }
    `,
    physical: tire
      ? /* glsl */ `
      material.roughness = mix(material.roughness,.71+turnedMarks*.027,
        photoMaterial*edgeBead*wheelFace*.56);
    `
      : /* glsl */ `
      float wheelWeight = photoMaterial*wheelFace;
      float machinedRoughness = mix(.365,.205,wheelLip)+turnedMarks*.058;
      material.roughness = mix(material.roughness,machinedRoughness,wheelWeight);
      material.specularColor = mix(material.specularColor,
        vec3(.50,.47,.43)*mix(.75,1.03,wheelLip),wheelWeight*.74);
    `,
    outgoing: '',
  };
}

function lampFinish(rear: boolean) {
  return {
    declarations: '',
    color: rear
      ? /* glsl */ `
      float lensPhase = worldCarSurface.y*510.;
      float ribs = cos(lensPhase)*(1.-smoothstep(1.0,3.1,fwidth(lensPhase)));
      diffuseColor.rgb *= mix(vec3(1.),vec3(.93,.82,.81)*(1.+ribs*.082),photoMaterial);
    `
      : '',
    physical: '',
    outgoing: /* glsl */ `
      vec3 lensEye = normalize(cameraPosition-worldCarSurface);
      vec3 lensNormal = inverseTransformDirection(normal,viewMatrix);
      float edgeLight = pow(1.-clamp(abs(dot(lensEye,lensNormal)),0.,1.),2.6);
      vec3 lensReflection = reflectedCornerLight(worldCarSurface,lensEye,lensNormal,.019);
      outgoingLight += photoMaterial * (lensReflection*.58
        + edgeLight * ${rear ? 'vec3(.078,.021,.012)' : 'vec3(.063,.070,.074)'});
    `,
  };
}

export function ferrariDetailShader(material: string) {
  if (material === 'material_9') return wheelFinish(true);
  if (material === 'material' || material === 'Rim_-_Black_part') return wheelFinish(false);
  if (material === 'material_7' || material === 'material_20') return lampFinish(true);
  if (material === 'Headlight_Glass') return lampFinish(false);
  return null;
}
