export const ATMOSPHERE = {
  vertexShader: /* glsl */ `
    varying vec3 vWorld;
    void main() {
      vWorld = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * viewMatrix * vec4(vWorld, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uOuter;
    uniform vec3 uSun;
    varying vec3 vWorld;
    void main() {
      vec3 dir = normalize(vWorld - cameraPosition);
      float b = length(cross(dir, cameraPosition));
      float t = clamp((b - 1.0) / (uOuter - 1.0), 0.0, 1.0);

      // Sunlight brightens the atmosphere without using the event palette.
      vec3 nearest = normalize(cameraPosition + dir * -dot(cameraPosition, dir));
      float sun = mix(0.34, 1.0, smoothstep(-0.28, 0.42, dot(nearest, uSun)));

      gl_FragColor = vec4(uColor, pow(1.0 - t, 2.6) * uIntensity * sun);
    }`,
};
