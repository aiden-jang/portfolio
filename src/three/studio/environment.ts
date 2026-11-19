import * as THREE from 'three';

export function createStudioEnvironment(generator: THREE.PMREMGenerator) {
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0.073, 0.065, 0.059);
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
    [7.4, 2.85],
    [4.8, 2.38, 0.48],
    [0, 0.62, -0.16],
    new THREE.Color(1, 0.964, 0.918),
    10.6,
  );
  luminousPanel(
    [5.2, 2.12],
    [-3.25, 3.36, 6.05],
    [0, 0.48, 0],
    new THREE.Color(0.83, 0.89, 1),
    4.15,
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
  const result = generator.fromScene(studio, 0.021, 0.1, 35);
  studio.traverse((mesh) => {
    if (mesh instanceof THREE.Mesh) {
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  });
  return result;
}
