const shadowWeight: Readonly<Record<string, number>> = {
  'toyota-a80-supra.glb': 0.91,
  'porsche-930-911-rwb.glb': 0.61,
  'bmw-e30-m3.glb': 0.92,
  'porsche-930-turbo-1975.glb': 1,
  'porsche-917k-lm-red.glb': 0.83,
  'red-bull-rb16b.glb': 1,
  'ferrari-f1-75.glb': 0.9,
  'nissan-r35-aimgain.glb': 0.78,
  'corvette-c8r-tf-sport.glb': 0.2,
  'ferrari-296-gt3.glb': 0.17,
  'porsche-992-gt3-rs.glb': 0.24,
  'lamborghini-countach-5000qv.glb': 0.21,
  'bmw-m1-turbo.glb': 0.25,
};

export function afterHoursShadowWeight(file: string, paint: string) {
  return paint === '#3f464e' ? 1 : (shadowWeight[file] ?? 0.46);
}

// Fitted model coordinates. Each pair is the forward lens position and absolute rear lens position.
export const lampFloorOrigins: Readonly<Record<string, readonly [number, number]>> = {
  'ferrari-f120-f40.glb': [1.9, 2.2],
  'mercedes-benz-w198-300-sl.glb': [2.14, 1.99],
  'toyota-a80-supra.glb': [1.95, 2.09],
  'porsche-930-911-rwb.glb': [1.93, 2.12],
  'bmw-e30-m3.glb': [2.07, 2.14],
  'datsun-s30-280z.glb': [1.56, 2.21],
  'audi-r8.glb': [1.79, 2.06],
  'porsche-930-turbo-1975.glb': [1.88, 2.1],
  'porsche-917k-lm-red.glb': [1.8, 2.16],
  'bmw-g82-m4-adro.glb': [1.89, 2.02],
  'mazda-mx5-na.glb': [1.9, 2.09],
  'toyota-gr-supra.glb': [1.81, 2.03],
  'porsche-992-911-gt3.glb': [1.75, 2.04],
  'lamborghini-aventador.glb': [1.79, 1.95],
  'ferrari-296-gt3.glb': [1.82, 1.99],
  'red-bull-rb16b.glb': [0, 2.18],
  'ferrari-f1-75.glb': [0, 2.24],
  'nissan-r35-aimgain.glb': [1.83, 2.12],
  'porsche-992-gt3-rs.glb': [1.65, 2.03],
  'lamborghini-countach-5000qv.glb': [2.16, 2.16],
  'corvette-c8r-tf-sport.glb': [1.86, 2.08],
  'bmw-m1-turbo.glb': [2.08, 2.0],
};
