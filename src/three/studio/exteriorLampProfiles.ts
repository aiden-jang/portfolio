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

const slimRearLamp = emit(stop, 0.78, 'back');
const amberBulb = emit(amber, 0.92);
const reverseBulb = emit(reverse, 0.88, 'back');

const f40Repeater =
  'smoothstep(.90,.925,abs(lampPosition.x))*smoothstep(.47,.49,lampPosition.y)' +
  '*(1.-smoothstep(1.599,1.617,lampPosition.z))';
// Shared lenses use their texture and fitted bounds to isolate the lit sections.
export const exteriorLampShaders: Partial<Record<string, Record<string, string>>> = {
  'ferrari-f120-f40.glb': {
    Headlight_Glass: emit(warm, 0.84, `front*${whiteTexture}`),
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
  },
  [MIATA_MODEL]: {
    'Material.012': tintedLenses(`max(${corners},${side})`),
  },
  'toyota-gr-supra.glb': {
    orange_light: amberBulb,
    light: reverseBulb,
    taillights: tintedLenses('back'),
  },
  'porsche-992-911-gt3.glb': {
    Porsche_911GT3_2022LightA_Material:
      tintedLenses(`max(${corners},${side})`) +
      emit(stop, 0.64, `back*${below(0.49)}*${redTexture}`),
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
  },
  'porsche-992-gt3-rs.glb': {
    Wheel_Paint_Red: tintedLenses('back'),
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
