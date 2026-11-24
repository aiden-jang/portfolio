import { MIATA_MODEL } from '../../cars';

const amber = 'vec3(1.20,.46,.055)';
const reverse = 'vec3(.82,.94,1.08)';
const warm = 'vec3(1.06,.82,.56)';
const stop = 'vec3(1.36,.035,.018)';
const amberTexture = 'amberLens(max(diffuseColor.rgb,totalEmissiveRadiance))';
const whiteTexture = 'neutralLens(max(diffuseColor.rgb,totalEmissiveRadiance))';
const redTexture = 'redLens(max(diffuseColor.rgb,totalEmissiveRadiance))';
const corners = 'max(front,back)';
const side = 'smoothstep(.71,.89,abs(lampPosition.x))';
const below = (height: number) => `(1.-smoothstep(${height - 0.03},${height},lampPosition.y))`;

function emit(color: string, amount: number, scope = '1.') {
  return `outgoingLight += ${color} * (${scope}) * lightView * ${amount.toFixed(2)};\n`;
}

function tintedLenses(frontScope = corners, rearScope = 'back') {
  return (
    emit(amber, 0.89, `${amberTexture}*(${frontScope})`) +
    emit(reverse, 0.61, `${whiteTexture}*(${rearScope})`)
  );
}

function plateLight(top: number) {
  return `outgoingLight += diffuseColor.rgb * vec3(.64,.58,.46) * back * lampLevel
    * exp(-pow((lampPosition.y-${top.toFixed(3)})/.09,2.));\n`;
}

const slimRearLamp = emit(stop, 0.78, 'back');
const amberBulb = emit(amber, 0.92);
const reverseBulb = emit(reverse, 0.88, 'back');

const f40Repeater =
  'smoothstep(.90,.925,abs(lampPosition.x))*smoothstep(.47,.49,lampPosition.y)' +
  '*(1.-smoothstep(1.599,1.617,lampPosition.z))';
const f40FrontLamp =
  'smoothstep(1.92,1.99,lampPosition.z)' +
  '*exp(-pow((abs(lampPosition.x)-.65)/.085,2.)-pow((lampPosition.y-.475)/.030,2.))';

// Shared lenses use their texture and fitted bounds to isolate the lit sections.
export const exteriorLampShaders: Partial<Record<string, Record<string, string>>> = {
  'ferrari-f120-f40.glb': {
    Headlight_Glass: emit(warm, 0.84, `front*${whiteTexture}`),
    Translucent: emit(warm, 0.78, f40FrontLamp),
    material_11: emit(amber, 1.08, `front*${amberTexture}`),
    material_14:
      emit(amber, 0.84, `front*${amberTexture}`) +
      emit(amber, 0.94, f40Repeater) +
      `diffuseColor.a = mix(diffuseColor.a,.78,lampLevel * (${f40Repeater}));`,
    material_20: tintedLenses('back') + emit(stop, 0.39, `back*${redTexture}`),
  },
  'mercedes-benz-w198-300-sl.glb': {
    'Material.003': emit(amber, 0.75) + 'diffuseColor.a = mix(diffuseColor.a,.57,lampLevel);',
    'Material.005': amberBulb,
    'Material.006': tintedLenses('back'),
  },
  'toyota-a80-supra.glb': {
    TOYOTA_SUPRA_BRAKE_LIGHT: slimRearLamp,
    TOYOTA_SUPRA_REVERSE_LIGHT: reverseBulb,
    TOYOTA_SUPRA_TURNSIGNAL_LEFT: amberBulb,
    TOYOTA_SUPRA_TURNSIGNAL_RIGHT: amberBulb,
  },
  'porsche-930-911-rwb.glb': {
    M_Lights: tintedLenses(`max(${corners},${side})`),
    M_Glass_Lights: emit(warm, 0.79, `front*${below(0.62)}*${whiteTexture}`),
  },
  'bmw-e30-m3.glb': {
    BMW_E30_M3_LENS:
      emit(amber, 0.89, `amberLens(diffuseColor.rgb)*max(${corners},${side})`) +
      emit(reverse, 0.75, 'back*neutralLens(diffuseColor.rgb)'),
  },
  'datsun-s30-280z.glb': {
    '280z_Reverse_lamp': reverseBulb,
    '280z_Turnsignal_lamp': amberBulb,
  },
  'audi-r8.glb': {
    white_lights: emit(reverse, 0.72, 'back'),
    red_lights: emit(amber, 0.88, `back*${amberTexture}`),
    license_plate: plateLight(0.725),
  },
  'porsche-930-turbo-1975.glb': {
    'Material.011': emit(amber, 0.93, 'back'),
    'Material.012': reverseBulb,
    'Material.013':
      tintedLenses('front', '0.') + emit(warm, 0.88, `front*${below(0.39)}*${whiteTexture}`),
  },
  'porsche-917k-lm-red.glb': {
    o_glass: emit(amber, 0.85, 'back'),
  },
  'bmw-g82-m4-adro.glb': {
    untitledBMW_M4CompetitionG82TNR3_2021LightD_Material1: tintedLenses(`max(${corners},${side})`),
    untitledBMW_M4CompetitionG82TNR3_2021ManufacturerPlateD_Material1: plateLight(0.768),
  },
  [MIATA_MODEL]: {
    'Material.012': tintedLenses(`max(${corners},${side})`),
  },
  'toyota-gr-supra.glb': {
    orange_light: amberBulb,
    light: reverseBulb,
    taillights: tintedLenses('back'),
    carplate: plateLight(0.623),
  },
  'porsche-992-911-gt3.glb': {
    Porsche_911GT3_2022LightA_Material:
      tintedLenses(`max(${corners},${side})`) +
      emit(stop, 0.64, `back*${below(0.49)}*${redTexture}`),
    Porsche_911GT3_2022ManufacturerPlateA_Material: plateLight(0.562),
  },
  'lamborghini-aventador.glb': {
    Lamborghini_AventadorSVJRewardRecycled_2019LightA_Material: tintedLenses(
      `max(${corners},${side})`,
    ),
  },
  'ferrari-296-gt3.glb': {
    AR3DMat_PBR_Light_Cool_White: emit(amber, 0.67, `(1.-front)*${side}`),
    mat_262: tintedLenses('back'),
  },
  'nissan-r35-aimgain.glb': {
    nNissan_GTRTNR4_2017LightE_Material1:
      tintedLenses(`max(${corners},${side})`) +
      emit(warm, 0.69, `front*${below(0.44)}*${whiteTexture}`),
    nNissan_GTRTNR4_2017ManufacturerPlateE_Material1: plateLight(0.602),
  },
  'porsche-992-gt3-rs.glb': {
    Wheel_Paint_Red: tintedLenses('back'),
    Wheel_Paint_Red_46: emit(reverse, 0.61, 'back'),
    Wheel_Paint_Red_61: plateLight(0.558),
  },
  'lamborghini-countach-5000qv.glb': {
    Fri1Mtl: emit(warm, 0.76, 'front'),
    Meshpart17Mtl: tintedLenses(`max(${corners},${side})`),
    Meshpart26Mtl: emit(amber, 0.72, `front*${amberTexture}`),
  },
  'corvette-c8r-tf-sport.glb': {
    GLASS: tintedLenses(
      'max(front,back)*smoothstep(.52,.85,abs(lampPosition.x))',
      `back*${below(0.65)}`,
    ),
  },
  'bmw-m1-turbo.glb': {
    bmw_m1_lights_vehicles_basic__VehicleBasic: tintedLenses(`max(${corners},${side})`),
    bmw_m1_taillight_vehicles_basic_translucent__VehicleBasic_Trans: tintedLenses('front', '0.'),
  },
};
