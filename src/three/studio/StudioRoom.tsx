import { inStudioDusk } from '../../garageExhibits/state';
import { useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getStudioProjection, photoProjectionGlsl } from './projection';
import { inBlackout, useGarageStudio } from '../../garageStudio/state';
import { studioTexture } from './textures';

const photoWallVertex = /* glsl */ `
  varying vec3 worldWallPoint;
  varying vec2 wallPlane;
  void main() {
    wallPlane = position.xy;
    worldWallPoint = (modelMatrix * vec4(position,1.)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.);
  }`;

const photoWallFragment = /* glsl */ `
  uniform sampler2D concrete;
  uniform float wallSurface;
  uniform float roomDim;
  uniform float studioDusk;
  varying vec3 worldWallPoint;
  varying vec2 wallPlane;
  ${photoProjectionGlsl}

  // Project the same light onto every wall in world space as the camera orbits.
  float backdropWash(vec3 point) {
    vec3 delta = point - vec3(2.55, 5.45, 2.4);
    vec3 axis = normalize(vec3(-.46, -.39, .80));
    vec3 right = normalize(cross(axis, vec3(0.,1.,0.)));
    vec3 up = cross(right, axis);
    float range = dot(delta, axis);
    float distance = max(range, 0.);
    vec2 spread = vec2(1.25, .35) + vec2(.28, .18) * distance;
    vec2 offset = vec2(dot(delta, right), dot(delta, up)) / spread;
    return exp(-dot(offset, offset)) * smoothstep(.1, 1.6, range) / (1. + .024 * distance);
  }

  void main() {
    vec3 room = roomPoint(worldWallPoint);
    bool frontWall = wallSurface == 1.;
    bool returnWall = wallSurface == 2.;
    bool corner = wallSurface == 3.;
    bool ceiling = wallSurface == 4.;
    float across = frontWall ? room.x : returnWall ? room.z : wallPlane.x;
    // Keep the casting boards horizontal and at a consistent physical scale
    // on the front wall and the return, including when the camera is close.
    vec2 materialUv = vec2(across+.48,room.y+.31) * vec2(.37,.37);
    vec3 luma = vec3(.2126,.7152,.0722);
    float albedo = dot(texture2D(concrete,materialUv).rgb,luma);
    float mottle = dot(texture2D(concrete,materialUv*.39+vec2(.21,.56),4.).rgb,luma);
    float relief = clamp(1. + (albedo-.0664)*14.5 + (mottle-.0664)*8.2,.56,1.47);
    vec2 footprint = clamp(fwidth(materialUv)*.65,vec2(.0017),vec2(.014));
    vec2 castGrain = vec2(
      dot(texture2D(concrete,materialUv+vec2(footprint.x,0.)).rgb,luma)
        - dot(texture2D(concrete,materialUv-vec2(footprint.x,0.)).rgb,luma),
      dot(texture2D(concrete,materialUv+vec2(0.,footprint.y)).rgb,luma)
        - dot(texture2D(concrete,materialUv-vec2(0.,footprint.y)).rgb,luma)
    );
    float grainFacingLight = dot(castGrain,vec2(frontWall ? .85 : -.85,.41));
    float grazingRelief = clamp(1. + grainFacingLight*20.,.51,1.61);

    float panelPosition = (across+.83+room.z*.079)/4.18;
    float panelNumber = floor(panelPosition);
    float localPanel = fract(panelPosition);
    float joint = (localPanel-.5)*4.18;
    float shadowInJoint = exp(-pow(abs(joint)*42.,2.));
    float lip = .070*exp(-pow((joint-.025)*46.,2.));
    float castTone = fract(sin(panelNumber*46.741+wallSurface*3.17)*1489.8);
    float panel = (1.-.37*shadowInJoint+lip)*mix(.93,1.065,castTone);
    float pinX = .25 + .10*castTone;
    float pinY = 1.30 + .32*castTone;
    vec2 toTieHole = vec2((localPanel-pinX)*4.18,room.y-pinY);
    float tie = 1.-smoothstep(.014,.035,length(toTieHole));
    float tieLip = exp(-pow((length(toTieHole+vec2(0.,.009))-.031)*80.,2.));
    if (!corner && !ceiling && castTone>.20) panel *= 1.-.40*tie+.13*tieLip;
    float floorJoin = .47 + .53*smoothstep(.018,.45,room.y);
    floorJoin *= .82+.18*smoothstep(.018,.073,room.y);
    float spill = lightBarBounce(room) * exp(-room.y*.45);
    float softBounce = roomGlow(vec2(room.x,room.y),
      vec2(studioLightBarX-.12,1.62),vec2(3.3,1.54)) * exp(-abs(room.z)*.49);
    float bounce = roomGlow(room.xz,vec2(-6.25,9.2),vec2(6.15,7.1))
      * exp(-pow((room.y-1.34)*.48,2.));
    vec3 finish = vec3(.0088,.0080,.0071) + vec3(.023,.021,.019)*spill
      + vec3(.017,.014,.011)*softBounce + vec3(.031,.028,.025)*bounce;
    vec3 wall = finish * floorJoin * panel * (ceiling ? .59 : 1.);
    float toCorner = room.x - studioLightBarX;
    if (frontWall) {
      vec4 photo = wallPhotograph(worldWallPoint);
      vec3 concreteTone = clamp(photo.rgb,wall*.59,wall*1.46+vec3(.004));
      float photoMix = photo.a * .83 * (1.-smoothstep(-4.2,-1.55,toCorner));
      wall = mix(wall,concreteTone,photoMix);
    }
    wall *= relief;
    if (!corner && !ceiling) {
      vec2 chipUv = vec2(joint+.018,room.y-1.38);
      float irregular = .007*sin(room.y*319.) + .005*sin(room.y*97. + panelNumber*2.7);
      float flake = exp(-pow(abs(chipUv.x+irregular)*32.,2.)-pow(chipUv.y*16.,2.));
      float edge = exp(-pow(abs(chipUv.x-.014+irregular)*62.,2.)-pow(chipUv.y*17.,2.));
      wall *= 1.+(edge*.103-flake*.24)*smoothstep(.20,.60,castTone)*grazingRelief;
    }

    if (frontWall || returnWall || corner) {
      float distanceToFixture = frontWall ? abs(toCorner) : abs(room.z);
      // The recessed edge shades the front wall immediately beside the bar.
      // The facing return gets the sharper graze and a quieter secondary bounce.
      float nearEnd = smoothstep(-.15,.62,room.y);
      float farEnd = 1.-smoothstep(2.45,3.57,room.y);
      float heightProfile = nearEnd*farEnd;
      float frontBounce = exp(-pow((distanceToFixture-1.36)/2.90,2.))
        * smoothstep(.37,1.02,distanceToFixture);
      float returnGraze = .89*exp(-distanceToFixture/.443)
        + .11*exp(-distanceToFixture/1.12);
      if (frontWall) {
        wall *= .76+.24*smoothstep(.28,.99,distanceToFixture);
      } else if (returnWall) {
        wall *= .79;
      }
      float transfer = frontWall ? .047*frontBounce : .223*returnGraze;
      wall += cornerLightTint()*transfer*heightProfile*relief*grazingRelief;
    }

    if (corner) {
      float y = room.y;
      float capMask = smoothstep(.09,.125,y) * (1.-smoothstep(2.80,2.84,y));
      float trim = smoothstep(.117,.145,y) * (1.-smoothstep(2.78,2.81,y));
      float pixelWidth = max(fwidth(wallPlane.x),.0016);
      vec3 eye = roomPoint(cameraPosition);
      vec2 toEye = eye.xz-room.xz;
      float viewDepth = max(dot(toEye,vec2(-.707107,.707107)),.18);
      float parallax = .011 * dot(toEye,vec2(.707107,.707107)) / viewDepth;
      float core = 1.-smoothstep(.018-pixelWidth*.62,.018+pixelWidth*.62,
        abs(wallPlane.x-parallax));
      core *= smoothstep(.155,.199,y) * (1.-smoothstep(2.735,2.78,y));
      float liner = max(0.,1.-abs(wallPlane.x)/.041);
      vec3 channel = mix(vec3(.013,.011,.009),vec3(.019,.016,.012),liner);
      wall = mix(wall*.81,channel,trim*.83);
      wall = mix(wall,vec3(.011,.010,.009),max(0.,capMask-trim)*.82);
      wall += core*vec3(1.39,1.20,.98);
    }
    if (!ceiling && !corner) {
      float wash = backdropWash(worldWallPoint);
      float bottomBounce = .28 + .72*smoothstep(0., .37, room.y);
      wall += vec3(.169,.150,.127)*wash*bottomBounce*panel*relief*grazingRelief;
    }
    wall *= corner ? mix(1.,0.79,roomDim) : mix(1.,0.27,roomDim);
    float duskWash = exp(-pow((room.x-studioLightBarX+1.6)/2.9,2.))*(1.-smoothstep(.40,3.7,room.y));
    wall *= mix(vec3(1.),vec3(.79,.60,.51),studioDusk);
    wall += vec3(.16,.063,.022)*duskWash*studioDusk;
    gl_FragColor = vec4(wall,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;

export function StudioRoom() {
  const mobile = useThree((state) => state.size.width < 768);
  const aspect = useThree(({ size }) => (size.height > 0 ? size.width / size.height : 1.6));
  const invalidate = useThree(({ invalidate }) => invalidate);
  const studioDusk = useMemo(() => ({ value: 0 }), []);
  const roomDim = useMemo(() => ({ value: 0 }), []);
  useFrame((_state, dt) => {
    const { active, study, chapter } = useGarageStudio.getState();
    const dusk = inStudioDusk({ active, chapter });
    studioDusk.value += (Number(dusk) - studioDusk.value) * Math.min(dt * 12, 1);
    const dim = inBlackout()
      ? 1
      : active && (study === 'shadows' || study === 'reflection')
        ? 0.94
        : 0;
    roomDim.value = THREE.MathUtils.lerp(roomDim.value, dim, Math.min(1, dt * 12));
  });
  const room = getStudioProjection(mobile);
  const framing = useMemo(() => room.roomFraming(aspect), [room, aspect]);
  useLayoutEffect(() => {
    room.uniforms.studioLightBarX.value = framing.cornerX;
    room.uniforms.studioPhotoFitX.value = framing.photoFitX;
    invalidate();
  }, [framing, invalidate, room]);
  const surfaces = useMemo(() => {
    const { texture: concrete } = studioTexture('concrete.jpg');
    const walls = [0, 1, 2, 3, 4].map(
      (wallSurface) =>
        new THREE.ShaderMaterial({
          vertexShader: photoWallVertex,
          fragmentShader: photoWallFragment,
          uniforms: {
            ...room.uniforms,
            concrete: { value: concrete },
            wallSurface: { value: wallSurface },
            roomDim,
            studioDusk,
          },
        }),
    );
    return walls;
  }, [room, roomDim, studioDusk]);

  useLayoutEffect(
    () => () => {
      surfaces.forEach((material) => material.dispose());
    },
    [surfaces],
  );

  const leftEdge = -13.3;
  const backEdge = 15.95;
  const bevel = 0.055;
  const cornerX = framing.cornerX;
  const frontWidth = cornerX - bevel - leftEdge;
  const returnDepth = backEdge - bevel;
  const wallRoom = [
    {
      at: [leftEdge + frontWidth / 2, 4.45, 0],
      angle: 0,
      width: frontWidth,
      material: 1,
    },
    {
      at: [cornerX, 4.45, bevel + returnDepth / 2],
      angle: -Math.PI / 2,
      width: returnDepth,
      material: 2,
    },
    {
      at: [cornerX - bevel / 2, 4.45, bevel / 2],
      angle: -Math.PI / 4,
      width: bevel * Math.SQRT2,
      material: 3,
    },
    { at: [0, 4.45, -10.85], angle: 0, width: 26.64, material: 0 },
    {
      at: [leftEdge, 4.45, 2.55],
      angle: Math.PI / 2,
      width: 26.83,
      material: 0,
    },
    { at: [13.3, 4.45, 2.55], angle: -Math.PI / 2, width: 26.83, material: 0 },
    { at: [0, 4.45, backEdge], angle: Math.PI, width: 26.64, material: 0 },
  ] as const;
  return (
    <group position={room.origin} quaternion={room.wallAngle}>
      {wallRoom.map(({ at, angle, width, material }, index) => (
        <mesh key={index} position={at} rotation-y={angle} material={surfaces[material]}>
          <planeGeometry args={[width, 8.9]} />
        </mesh>
      ))}
      <mesh position={[0, 8.9, 2.55]} rotation-x={Math.PI / 2} material={surfaces[4]}>
        <planeGeometry args={[26.64, 26.83]} />
      </mesh>
    </group>
  );
}
