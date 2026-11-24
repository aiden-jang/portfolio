import { MIATA_MODEL } from '../../cars';

export type LampFloorProfile = {
  head?: { spacing: number; warmth: number };
  tail: number;
};

type LampProfile = LampFloorProfile & { materials: Record<string, string> };

const warm = 'vec3(1.12,.84,.52)';
const neutral = 'vec3(1.00,.94,.82)';
const cool = 'vec3(.81,.92,1.16)';
const head = (color: string, mask = '1.', scope = 'front') =>
  `outgoingLight += ${color} * (${mask}) * (${scope}) * lightView;`;
const tail = (mask = 'redLens(diffuseColor.rgb)') =>
  `outgoingLight += vec3(1.37,.022,.012) * (${mask}) * back * lightView;`;
const reflector = '.22 + .85*neutralLens(diffuseColor.rgb)';
const led = '1.9*neutralLens(diffuseColor.rgb)';
const redTexture = 'redLens(max(diffuseColor.rgb,totalEmissiveRadiance))';
const projectorCover = `
  vec2 lensOffset = vec2((abs(lampPosition.x)-.665)/.079,(lampPosition.y-.669)/.043);
  float lensCore = exp(-dot(lensOffset,lensOffset))*front;
  outgoingLight += vec3(.88,.96,1.15)*1.20*lensCore*lightView;
  diffuseColor.a = mix(diffuseColor.a,.70,lensCore*lampLevel);
`;
const redCover =
  tail('1.10') +
  `
  diffuseColor.a = mix(diffuseColor.a,.70,back*lampLevel);
`;
const rain = tail('.28 + 1.48*redLens(diffuseColor.rgb) + .10*float(abs(lampPosition.x)<.09)');

export const additionalAfterHoursLamps: Partial<Record<string, LampProfile>> = {
  'toyota-a80-supra.glb': {
    head: { spacing: 0.51, warmth: 0.45 },
    tail: 0.54,
    materials: {
      TOYOTA_SUPRA_MAIN_LIGHT: head(neutral, '1.15') + tail(redTexture),
      TOYOTA_SUPRA_LIGHT_GLASS: tail(),
      TOYOTA_SUPRA_HEADLIGHT_BASE_CHROME: head(
        neutral,
        '1.22*exp(-pow((abs(lampPosition.x)-.50)/.14,2.)-pow((lampPosition.y-.625)/.078,2.))',
      ),
    },
  },
  'porsche-930-911-rwb.glb': {
    head: { spacing: 0.66, warmth: 0.72 },
    tail: 0.73,
    materials: {
      M_Lights:
        head(warm, reflector) +
        tail('redLens(diffuseColor.rgb)*smoothstep(.46,.56,abs(lampPosition.x))'),
    },
  },
  'bmw-e30-m3.glb': {
    head: { spacing: 0.52, warmth: 0.75 },
    tail: 0.64,
    materials: {
      BMW_E30_M3_HEADLIGHT_REFLECTOR: head(warm, '1.15'),
      BMW_E30_M3_LENS: tail(),
      BMW_E30_M3_TAILLIGHT_REFLECTOR:
        tail(redTexture) +
        `
        float unfilteredBulb = neutralLens(totalEmissiveRadiance) * back * lampLevel;
        outgoingLight = max(vec3(0.),outgoingLight - .95 * unfilteredBulb * totalEmissiveRadiance);
      `,
    },
  },
  'datsun-s30-280z.glb': {
    head: { spacing: 0.65, warmth: 0.86 },
    tail: 0.49,
    materials: {
      '280z_Headlight_lamp': head(warm, '1.12', 'smoothstep(1.47,1.54,lampPosition.z)'),
      '280z_Brake_lamp': tail('.32 + .68*' + redTexture),
    },
  },
  'audi-r8.glb': {
    head: { spacing: 0.71, warmth: 0.12 },
    tail: 0.73,
    materials: { white_lights: head(cool, '1.35'), red_lights: tail('1.') },
  },
  'porsche-930-turbo-1975.glb': {
    head: { spacing: 0.66, warmth: 0.86 },
    tail: 0.48,
    materials: { 'Material.010': head(warm, reflector), 'Material.006': tail('.90') },
  },
  'porsche-917k-lm-red.glb': {
    head: { spacing: 0.83, warmth: 0.72 },
    tail: 0.6,
    materials: {
      lamp: head(warm, '.92'),
      light_chrome: head(warm, '.52*neutralLens(diffuseColor.rgb)'),
      r_glass: tail('.55 + .35*redLens(diffuseColor.rgb)'),
    },
  },
  'bmw-g82-m4-adro.glb': {
    head: { spacing: 0.67, warmth: 0.08 },
    tail: 0.66,
    materials: { untitledBMW_M4CompetitionG82TNR3_2021LightD_Material1: head(cool, led) + tail() },
  },
  [MIATA_MODEL]: {
    head: { spacing: 0.57, warmth: 0.71 },
    tail: 0.67,
    materials: { 'Material.012': tail() },
  },
  'toyota-gr-supra.glb': {
    head: { spacing: 0.7, warmth: 0.1 },
    tail: 0.68,
    materials: { light: head(cool, '1.1'), taillights: tail(redTexture) },
  },
  'porsche-992-911-gt3.glb': {
    head: { spacing: 0.7, warmth: 0.15 },
    tail: 0.58,
    materials: {
      Porsche_911GT3_2022LightA_Material: head(cool, led) + tail(),
      Porsche_911GT3_2022Window_Material: projectorCover,
      RED_GLASS: redCover,
    },
  },
  'lamborghini-aventador.glb': {
    head: { spacing: 0.76, warmth: 0.12 },
    tail: 0.75,
    materials: {
      Lamborghini_AventadorSVJRewardRecycled_2019LightA_Material: head(cool, led) + tail(),
      RED_GLASS: redCover,
    },
  },
  'ferrari-296-gt3.glb': {
    head: { spacing: 0.7, warmth: 0.43 },
    tail: 0.68,
    materials: {
      AR3DMat_PBR_Light_Cool_White: head('vec3(1.16,.91,.56)'),
      mat_217: tail(),
      mat_50: tail('.36 + .62*redLens(diffuseColor.rgb)'),
    },
  },
  'red-bull-rb16b.glb': { tail: 0, materials: { rear_light: rain } },
  'ferrari-f1-75.glb': { tail: 0, materials: { ERS_LIGHTS: rain } },
  'nissan-r35-aimgain.glb': {
    head: { spacing: 0.64, warmth: 0.1 },
    tail: 0.64,
    materials: {
      nNissan_GTRTNR4_2017LightE_Material1: head(cool, led) + tail(),
      phong2: tail('.44*smoothstep(.52,.66,lampPosition.y)'),
    },
  },
  'porsche-992-gt3-rs.glb': {
    head: { spacing: 0.7, warmth: 0.12 },
    tail: 0.54,
    materials: {
      Wheel_Paint_Red: tail(),
      Wheel_Paint_Red_0: head(cool, '1.45'),
      Wheel_Paint_Red_4: projectorCover,
      Wheel_Paint_Red_59: tail('.92'),
    },
  },
  'lamborghini-countach-5000qv.glb': {
    head: { spacing: 0.48, warmth: 0.84 },
    tail: 0.69,
    materials: {
      F1Mtl: head(warm, '.72'),
      Meshpart17Mtl: tail(redTexture),
      Meshpart22Mtl: tail('.77'),
    },
  },
  'bmw-m1-turbo.glb': {
    head: { spacing: 0.51, warmth: 0.72 },
    tail: 0.69,
    materials: {
      FRONT_LIGHTS_REFLECTOR: head(warm, '1.1'),
      Material_3: head(warm, reflector),
      bmw_m1_lights_vehicles_basic__VehicleBasic: tail(),
    },
  },
};
