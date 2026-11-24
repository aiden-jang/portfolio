export const parkedLampMaterials: Record<string, Record<string, string>> = {
  'audi-r8.glb': { white_lights: '1.', red_lights: '1.' },
  'bmw-e30-m3.glb': { BMW_E30_M3_TAILLIGHT_REFLECTOR: '1.' },
  'corvette-c8r-tf-sport.glb': {
    GLASS: 'smoothstep(1.08, 1.40, abs(lampPosition.z))',
  },
  'datsun-s30-280z.glb': {
    '280z_Brake_lamp': '1.',
    '280z_Reverse_lamp': '1.',
    '280z_Turnsignal_lamp': '1.',
  },
  'ferrari-296-gt3.glb': { AR3DMat_PBR_Light_Cool_White: '1.' },
  'ferrari-f120-f40.glb': {
    Headlight_Glass: '1.',
    material_14: '1.',
    material_7: '1.',
  },
  'lamborghini-countach-5000qv.glb': { Fri1Mtl: '1.', Meshpart17Mtl: '1.' },
  'porsche-992-gt3-rs.glb': { Wheel_Paint_Red_59: '1.' },
  'toyota-gr-supra.glb': { light: '1.', taillights: '1.', orange_light: '1.' },
};

export const studioLensReflection: Record<string, Record<string, string>> = {
  'audi-r8.glb': { white_lights: '.53 * smoothstep(1.35,1.68,lampPosition.z)' },
  'porsche-930-911-rwb.glb': {
    M_Lights: '.57 * smoothstep(1.17,1.55,lampPosition.z)',
    M_Glass_Lights: '.47 * smoothstep(1.17,1.55,lampPosition.z)',
  },
};
