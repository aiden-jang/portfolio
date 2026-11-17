import { BufferAttribute, BufferGeometry, Points, ShaderMaterial } from 'three';
import { vector, type GlobeEvent } from './data';

// Magnitude sizing, the thermal palette and depth holes follow everythingisfine's event layer.
export function createMarkers(events: GlobeEvent[]) {
  const positions = new Float32Array(events.length * 3),
    mags = new Float32Array(events.length),
    depths = new Float32Array(events.length);
  events.forEach((event, i) => {
    vector(event.lon, event.lat, 1.006).toArray(positions, i * 3);
    mags[i] = event.magnitude;
    depths[i] = event.depth;
  });
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aMagnitude', new BufferAttribute(mags, 1));
  geometry.setAttribute('aDepth', new BufferAttribute(depths, 1));
  const material = new ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: { uPixelRatio: { value: 1 }, uScale: { value: 1 } },
    vertexShader: `
    attribute float aMagnitude;attribute float aDepth;
    uniform float uPixelRatio;uniform float uScale;
    varying float vMagnitude;varying float vDepth;varying float vFacing;
    void main(){
      vec3 world=(modelMatrix*vec4(position,1.)).xyz;
      vFacing=dot(normalize(position),normalize(cameraPosition-world));
      vMagnitude=clamp((aMagnitude-1.)/6.5,0.,1.);vDepth=clamp((aDepth-70.)/230.,0.,1.);
      gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
      gl_PointSize=2.*(1.+2.8*pow(max(0.,aMagnitude-1.),.7))*uScale*uPixelRatio;
    }`,
    fragmentShader: `
    varying float vMagnitude;varying float vDepth;varying float vFacing;
    vec3 thermal(float t){
      vec3 a=vec3(59.,42.,99.)/255.,b=vec3(138.,47.,85.)/255.,c=vec3(199.,69.,47.)/255.,d=vec3(232.,121.,27.)/255.,e=vec3(245.,194.,66.)/255.;
      float x=t*4.;if(x<1.)return mix(a,b,x);if(x<2.)return mix(b,c,x-1.);if(x<3.)return mix(c,d,x-2.);return mix(d,e,x-3.);
    }
    void main(){
      if(vFacing<=0.)discard;float dist=length(gl_PointCoord-vec2(.5));
      float alpha=1.-smoothstep(.42,.5,dist);if(alpha<=0.)discard;
      if(vDepth>.02)alpha*=smoothstep(.30*vDepth-.05,.30*vDepth+.02,dist);
      alpha*=smoothstep(0.,.25,vFacing);
      gl_FragColor=vec4(thermal(vMagnitude),alpha);
    }`,
  });
  const object = new Points(geometry, material);
  object.renderOrder = 10;
  object.frustumCulled = false;
  return {
    object,
    resize: (ratio: number, scale: number) => {
      material.uniforms.uPixelRatio.value = ratio;
      material.uniforms.uScale.value = scale;
    },
    dispose: () => {
      geometry.dispose();
      material.dispose();
    },
  };
}
