import * as THREE from 'three';
import { studioTexture } from './textures';

export const photoProjectionGlsl = /* glsl */ `
  uniform sampler2D studioPhoto;
  uniform mat4 studioProjector;
  uniform vec3 studioPhotoJoin;
  uniform float studioPhotoReady;
  uniform float studioPhotoFitX;
  uniform mat4 studioRoomBasis;
  uniform float studioLightBarX;
  uniform float studioBarBlue;

  vec3 roomPoint(vec3 worldPoint) {
    return (studioRoomBasis * vec4(worldPoint,1.)).xyz;
  }

  float roomGlow(vec2 p, vec2 at, vec2 widths) {
    vec2 delta = (p-at)/widths;
    return exp(-dot(delta,delta));
  }

  vec3 sceneRadiance(vec3 display) {
    display = clamp(display, vec3(0.), vec3(.9));
    vec3 a = 1. - .983729 * display;
    vec3 b = .0245786 - .4329510 * display;
    vec3 c = -.000090537 - .238081 * display;
    return .3 * (-b + sqrt(b*b - 4.*a*c)) / a;
  }

  vec2 studioImageUv(vec3 p) {
    vec4 q = studioProjector * vec4(p,1.);
    return q.xy / max(q.w,.001) * vec2(.5 * studioPhotoFitX,.5) + .5;
  }

  vec4 wallPhotograph(vec3 p) {
    vec4 q = studioProjector * vec4(p,1.);
    vec2 uv = q.xy / max(q.w,.001) * vec2(.5 * studioPhotoFitX,.5) + .5;
    vec2 edge = min(uv,1.-uv);
    float coverage = smoothstep(-.15,.043,edge.x) * smoothstep(-.13,.052,edge.y);
    coverage *= smoothstep(.12,2.8,q.w) * studioPhotoReady;

    float seam = uv.x < .5
      ? mix(studioPhotoJoin.x,studioPhotoJoin.y,clamp(uv.x*2.,0.,1.))
      : mix(studioPhotoJoin.y,studioPhotoJoin.z,clamp(uv.x*2.-1.,0.,1.));
    float assetJoin = 1.-seam;
    float roomJoin = clamp(studioImageUv(vec3(p.x,0.,p.z)).y,.06,.95);
    uv.y = assetJoin + (uv.y-roomJoin) * (1.-assetJoin) / (1.-roomJoin);
    vec3 plate = texture2D(studioPhoto,clamp(uv,vec2(.001),vec2(.999))).rgb;
    return vec4(sceneRadiance(plate),coverage);
  }

  float lightBarBounce(vec3 room) {
    vec2 fromBar = room.xz - vec2(studioLightBarX, .48);
    return exp(-length(fromBar * vec2(.115,.14)));
  }

  vec3 cornerLightTint() {
    return mix(vec3(1.,.80,.62),vec3(.23,.63,1.55),studioBarBlue);
  }

  vec3 reflectedAccent(vec3 warm, float amount) {
    vec3 ice = vec3(.54,.87,1.35) * dot(warm,vec3(.2126,.7152,.0722));
    return mix(warm,ice,studioBarBlue*amount);
  }

  float lightBarFloorWash(vec2 floorPosition) {
    vec2 offset = floorPosition - vec2(studioLightBarX-.026,.026);
    vec2 axis = normalize(mix(vec2(-.885,.465),vec2(-.80,.60),studioBarBlue));
    float along = dot(offset,axis);
    float across = dot(offset,vec2(axis.y,-axis.x));
    float distanceIn = max(0.,along);
    float coreWidth = mix(.30+.118*distanceIn,.14+.038*distanceIn,studioBarBlue);
    coreWidth = mix(coreWidth,.092+.026*distanceIn,studioBarBlue);
    float spillWidth = .75+.221*distanceIn;
    float core = exp(-pow(across/coreWidth,2.)-pow((distanceIn-2.65)/5.43,2.));
    float spill = exp(-pow(across/spillWidth,2.)-pow(distanceIn/6.94,2.));
    float inside = smoothstep(-.31,.65,along);
    float toe = .17+.83*smoothstep(.12,4.22,distanceIn);
    return (mix(mix(.66,.98,studioBarBlue),1.69,studioBarBlue)*core+mix(mix(.34,.10,studioBarBlue),.25,studioBarBlue)*spill)*inside*toe;
  }

  float floorCornerReflection(vec3 worldPoint, vec3 viewPosition, float textureRelief) {
    vec3 p = roomPoint(worldPoint);
    vec3 eye = roomPoint(viewPosition);
    vec3 ray = normalize(vec3(p.x-eye.x,eye.y-p.y,p.z-eye.z));
    vec2 corner = vec2(studioLightBarX-.0275,.0275);
    vec2 inward = vec2(-.707107,.707107);
    float approach = -dot(inward,ray.xz);
    float depth = dot(inward,p.xz-corner);
    if (approach <= .018 || depth <= 0.) return 0.;
    float travel = depth/approach;
    vec3 hit = p + travel*ray;
    float across = dot(hit.xz-corner,vec2(.707107,.707107));
    float spread = (.47 + .058*min(9.,travel))*mix(1.1,.91,clamp(textureRelief-.3,0.,1.));
    float softLine = exp(-pow(across/(spread*mix(1.,.49,studioBarBlue)),2.));
    float endFade = smoothstep(-.4,.44,hit.y)*(1.-smoothstep(2.18,3.40,hit.y));
    return softLine*endFade*smoothstep(.06,.32,approach)/(1.+travel*.23);
  }

`;

function createStudioProjection(mobile: boolean) {
  const aspect = mobile ? 390 / 844 : 1.6;
  const joins = mobile
    ? new THREE.Vector3(0.484, 0.471, 0.457)
    : new THREE.Vector3(0.479, 0.443, 0.4);
  const opticalDistance =
    (mobile ? 9.35 : 8.7) * THREE.MathUtils.clamp(Math.sqrt(1.5 / aspect), 1, 1.85);
  const opening = new THREE.PerspectiveCamera(mobile ? 34 : 32, aspect, 0.1, 200);
  const radius = opticalDistance * Math.cos(0.19);
  opening.position.set(
    Math.sin(0.65) * radius,
    0.55 + Math.sin(0.19) * opticalDistance,
    Math.cos(0.65) * radius,
  );
  opening.lookAt(0, 0.55, 0);
  opening.updateMatrixWorld(true);

  function drawRay(horizontal: number, vertical: number) {
    return new THREE.Vector3(horizontal, 1 - 2 * vertical, 0.5)
      .unproject(opening)
      .sub(opening.position);
  }
  function groundPoint(horizontal: number, vertical: number) {
    const ray = drawRay(horizontal, vertical);
    return opening.position.clone().addScaledVector(ray, -opening.position.y / ray.y);
  }
  const left = groundPoint(-1, joins.x);
  const right = groundPoint(1, joins.z);
  const tangent = right.clone().sub(left).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const inward = tangent.clone().cross(up);
  const origin = left.clone().add(right).multiplyScalar(0.5);
  const basis = new THREE.Matrix4().makeBasis(tangent, up, inward);
  const wallAngle = new THREE.Quaternion().setFromRotationMatrix(basis);
  const inverse = basis.clone().setPosition(origin).invert();

  const plate = studioTexture(mobile ? 'plate-mobile.jpg' : 'plate-desktop.jpg');

  const uniforms = {
    studioPhoto: { value: plate.texture },
    studioProjector: {
      value: opening.projectionMatrix.clone().multiply(opening.matrixWorldInverse),
    },
    studioPhotoJoin: { value: joins },
    studioPhotoReady: plate.ready,
    studioPhotoFitX: { value: 1 },
    studioRoomBasis: { value: inverse },
    studioLightBarX: { value: 0 },
    studioBarBlue: { value: 0 },
  };

  function roomFraming(viewportAspect: number) {
    const ratio = Math.max(1, viewportAspect / aspect);
    const overscan = ratio + Math.min(0.075, (ratio - 1) * 0.5);
    const ray = drawRay(1.012 * overscan, joins.z);
    const wallDistance = origin.clone().sub(opening.position).dot(inward) / ray.dot(inward);
    const fixture = opening.position.clone().addScaledVector(ray, wallDistance);
    return {
      cornerX: THREE.MathUtils.clamp(fixture.sub(origin).dot(tangent), 2.8, 12.85),
      photoFitX: 1 / overscan,
    };
  }
  const framing = roomFraming(aspect);
  uniforms.studioLightBarX.value = framing.cornerX;
  uniforms.studioPhotoFitX.value = framing.photoFitX;
  return { uniforms, origin, wallAngle, roomFraming };
}

const byLayout = new Map<boolean, ReturnType<typeof createStudioProjection>>();
export function getStudioProjection(mobile: boolean) {
  const existing = byLayout.get(mobile);
  if (existing) return existing;
  const projection = createStudioProjection(mobile);
  byLayout.set(mobile, projection);
  return projection;
}
