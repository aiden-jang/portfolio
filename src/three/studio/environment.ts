import * as THREE from 'three';
export function createStudioEnvironment(
  generator: THREE.PMREMGenerator,
  preset: 'studio' | 'blackout' | 'optics' | 'dusk' | 'miata' | 'low-light' = 'studio',
) {
  const studio = new THREE.Scene();
  const refined = preset === 'optics';
  const miata = preset === 'miata';
  const lowLight = preset === 'low-light';
  studio.background = lowLight
    ? new THREE.Color(0.037, 0.033, 0.029)
    : new THREE.Color(0.073, 0.065, 0.059);
  const luminousPanel = (
    size: [number, number],
    position: [number, number, number],
    target: [number, number, number],
    color: THREE.Color,
    power: number,
  ) => {
    const fixture = new THREE.ShaderMaterial({
      uniforms: { radiance: { value: color.multiplyScalar(power) } },
      vertexShader:
        'varying vec2 pt; void main() { pt = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader:
        'varying vec2 pt; uniform vec3 radiance; void main() { vec2 v=abs(pt-.5)*2.; float taper=(1.-smoothstep(.62,1.,v.x))*(1.-smoothstep(.56,1.,v.y)); gl_FragColor=vec4(radiance*taper,1.); }',
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(...size), fixture);
    panel.position.set(...position);
    panel.lookAt(new THREE.Vector3(...target));
    studio.add(panel);
  };
  // Fixed fixtures give the moving camera a broad side reflection and a rear edge light.
  luminousPanel(
    lowLight ? [8.4, 1.1] : [7.4, 2.85],
    [4.8, 2.38, 0.48],
    [0, 0.62, -0.16],
    new THREE.Color(1, 0.964, 0.918),
    lowLight ? 3.05 : miata ? 4.4 : refined ? 5.7 : 10.6,
  );
  if (lowLight) {
    luminousPanel(
      [4.9, 0.55],
      [1.8, 3.15, -4.7],
      [0, 0.58, 1.35],
      new THREE.Color(1, 0.91, 0.81),
      5.1,
    );
  }
  luminousPanel(
    [5.2, 2.12],
    [-3.25, 3.36, 6.05],
    [0, 0.48, 0],
    new THREE.Color(0.83, 0.89, 1),
    lowLight ? 2.9 : miata ? 2.8 : refined ? 2.6 : 4.15,
  );
  luminousPanel([9.2, 3.6], [-6, 5.3, 2.4], [0, 0, 0], new THREE.Color(0.87, 0.92, 1), 1.05);
  luminousPanel(
    [7.6, 2.52],
    [-0.2, 4.05, -6.7],
    [0, 0.35, 0],
    new THREE.Color(0.91, 0.94, 1),
    2.02,
  );
  luminousPanel([4.8, 4.35], [2.15, 5.4, 5.2], [0, 0.55, 0], new THREE.Color(1, 0.965, 0.91), 0.92);
  luminousPanel(
    [4.85, 0.74],
    [2.1, 2.75, -5.8],
    [0, 0.73, -1.13],
    new THREE.Color(1, 0.92, 0.81),
    2.2,
  );
  if (preset === 'studio') {
    luminousPanel(
      [0.2, 2.65],
      [5.85, 1.48, -2.7],
      [0, 0.61, 0],
      new THREE.Color(1, 0.85, 0.69),
      8.2,
    );
  }
  if (lowLight) {
    luminousPanel(
      [4.9, 0.19],
      [0.75, 2.85, -4.9],
      [0, 0.75, 0],
      new THREE.Color(0.25, 0.77, 1),
      12.6,
    );
    // These fixed strips show up in the clear coat as the viewpoint moves.
    luminousPanel(
      [7.4, 1.32],
      [-4.45, 2.15, 1.35],
      [0, 0.68, 0],
      new THREE.Color(0.16, 0.43, 1),
      21.5,
    );
    luminousPanel(
      [6.8, 0.88],
      [4.02, 3.05, 1.75],
      [0, 0.76, 0],
      new THREE.Color(0.22, 0.6, 1),
      16.8,
    );
    luminousPanel(
      [5.8, 0.72],
      [0.45, 2.72, -5.5],
      [0, 0.85, -0.65],
      new THREE.Color(0.17, 0.45, 1),
      19.0,
    );
    // This narrow panel catches the front fender at the opening angle.
    luminousPanel(
      [0.56, 1.48],
      [4.1, 1.47, -0.16],
      [0.92, 0.64, 1.54],
      new THREE.Color(0.055, 0.38, 1),
      78,
    );
    luminousPanel(
      [0.26, 3.3],
      [5.85, 1.87, -2.7],
      [0, 0.61, 0],
      new THREE.Color(0.42, 0.72, 1),
      17.8,
    );
    luminousPanel(
      [6.35, 0.48],
      [-1.32, 3.55, -5.42],
      [0, 0.51, 0],
      new THREE.Color(0.9, 0.94, 1),
      4.8,
    );
  }
  if (refined) {
    luminousPanel(
      [8.7, 0.78],
      [0.08, 5.02, 0.9],
      [0, 0.7, 0.1],
      new THREE.Color(1, 0.96, 0.9),
      11.2,
    );
    luminousPanel(
      [7.4, 0.43],
      [-2.15, 4.78, -1.3],
      [0, 0.72, -0.6],
      new THREE.Color(0.82, 0.88, 1),
      7.9,
    );
    luminousPanel(
      [0.74, 3.75],
      [-4.51, 2.17, 1.7],
      [0, 0.71, 0.56],
      new THREE.Color(0.86, 0.91, 1),
      5.1,
    );
  }

  if (miata) {
    luminousPanel(
      [8.5, 0.72],
      [-2.4, 4.72, -5.3],
      [0, 0.64, 0.35],
      new THREE.Color(1, 0.963, 0.912),
      8.7,
    );
    luminousPanel(
      [7.2, 0.5],
      [4.55, 3.1, 0.42],
      [0, 0.54, 0.06],
      new THREE.Color(0.82, 0.94, 1),
      5.8,
    );
    luminousPanel(
      [5.8, 1.22],
      [-0.25, 3.13, 5.96],
      [0, 0.55, 0.07],
      new THREE.Color(0.95, 0.97, 1),
      5.4,
    );
  }

  if (preset === 'dusk') {
    for (const item of [...studio.children]) {
      if (item instanceof THREE.Mesh) {
        studio.remove(item);
        item.geometry.dispose();
        item.material.dispose();
      }
    }
    studio.background = new THREE.Color(0.035, 0.027, 0.021);
    luminousPanel(
      [8.6, 1.22],
      [6, 2.04, 3.7],
      [0, 0.68, -1.05],
      new THREE.Color(1, 0.68, 0.36),
      9.6,
    );
    luminousPanel(
      [5.5, 2.15],
      [-3.7, 3.18, 4.3],
      [0, 0.67, 0],
      new THREE.Color(0.63, 0.76, 1),
      2.4,
    );
    luminousPanel(
      [4.7, 0.48],
      [-2.3, 2.94, -5.2],
      [0, 0.64, -0.4],
      new THREE.Color(1, 0.69, 0.41),
      5.1,
    );
  }
  if (preset === 'blackout') {
    for (const item of [...studio.children]) {
      if (item instanceof THREE.Mesh) {
        studio.remove(item);
        item.geometry.dispose();
        item.material.dispose();
      }
    }
    studio.background = new THREE.Color(0.024, 0.022, 0.02);
    luminousPanel(
      [8.0, 0.54],
      [3.7, 2.62, 0.64],
      [0, 0.62, 0],
      new THREE.Color(1, 0.91, 0.79),
      9.8,
    );
    luminousPanel(
      [0.42, 3.45],
      [-3.2, 2.15, -3.0],
      [0, 0.55, -0.4],
      new THREE.Color(0.83, 0.91, 1),
      6.2,
    );
    luminousPanel([7.6, 1.0], [0.0, 4.1, -5.9], [0, 0.5, 0], new THREE.Color(1, 0.89, 0.76), 4.8);
    luminousPanel([4.0, 1.6], [-3.9, 2.1, 4.2], [0, 0.43, 0], new THREE.Color(0.81, 0.88, 1), 1.4);
  }
  const result = generator.fromScene(studio, 0.021, 0.1, 35);
  studio.traverse((mesh) => {
    if (mesh instanceof THREE.Mesh) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  });
  return result;
}
