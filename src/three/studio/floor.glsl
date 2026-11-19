      vec2 sceneUv = vUv.xy / vUv.w;
      vec2 ground = vFloorPosition.xz;
      float radius = length(ground);
      vec2 concreteUv = ground / 3.15 + vec2(.16,.74);
      vec3 luma = vec3(.2126,.7152,.0722);
      float fine = dot(texture2D(studioConcrete,concreteUv).rgb,luma);
      // A second, rotated sample brings out broad trowel variation and breaks
      // up repeats while leaving the fine aggregate at its natural scale.
      vec2 polishUv = ground*mat2(.106,.078,-.078,.106)+vec2(.42,.19);
      float coarse = dot(texture2D(studioConcrete,polishUv,2.).rgb,luma);
      float relief = clamp(1. + (fine-.0771)*17.6 + (coarse-.0771)*12.0,.63,1.42);
      vec2 screenFootprint = clamp(fwidth(concreteUv),vec2(.0025),vec2(.019));
      vec2 grainTilt = vec2(
        dot(texture2D(studioConcrete,concreteUv+vec2(screenFootprint.x,0.)).rgb,luma)-fine,
        dot(texture2D(studioConcrete,concreteUv+vec2(0.,screenFootprint.y)).rgb,luma)-fine
      );
      vec2 roughnessOffset = grainTilt*vec2(.086,.116) + vec2(fine-coarse,.0771-fine)*.043;
      float scatter = 2.74 + 1.22 * smoothstep(0.,5.,radius) + (1.0-relief)*1.35;
      vec2 offset = vec2(.003,.009) * mix(.95,1.5,smoothstep(0.,6.,radius));
      sceneUv += roughnessOffset;
      vec3 mirror = texture2D(tDiffuse, sceneUv, scatter).rgb * .40;
      mirror += texture2D(tDiffuse, sceneUv + offset, scatter + .45).rgb * .15;
      mirror += texture2D(tDiffuse, sceneUv - offset, scatter + .45).rgb * .15;
      mirror += texture2D(tDiffuse, sceneUv + vec2(-offset.x,offset.y), scatter + .45).rgb * .15;
      mirror += texture2D(tDiffuse, sceneUv + vec2(offset.x,-offset.y), scatter + .45).rgb * .15;
      vec3 room = roomPoint(vFloorPosition);
      float carArea = roomGlow(ground,vec2(.5,.34),vec2(4.8,5.35));
      float broadSpill = lightBarBounce(vec3(room.x,0.,room.z));
      float lightWash = lightBarFloorWash(room.xz);
      float diffuseReturn = roomGlow(room.xz,vec2(-6.25,9.2),vec2(6.15,7.1));
      vec3 neutral = vec3(.0062,.0058,.0054) + vec3(.018,.016,.014) * carArea;
      vec3 litMaterial = neutral + vec3(.014,.0115,.0095) * broadSpill
        + vec3(.0125,.011,.010) * diffuseReturn;
      float topcoat = clamp(1. + (coarse-.0771)*4.6,.91,1.10);
      float floorDarkening = .85 + .15*(1.-smoothstep(5.,17.,radius));
      vec3 litConcrete = litMaterial + cornerLightTint() * .193 * lightWash;
      vec3 floorTone = litConcrete * relief * topcoat * floorDarkening;
      float frontJoint = exp(-abs(room.z)*6.6) * (1.-smoothstep(studioLightBarX-.03,studioLightBarX+.24,room.x));
      float sideJoint = exp(-abs(room.x-studioLightBarX)*6.6) * smoothstep(0.,.14,room.z);
      float outerJoint = exp(-min(abs(abs(room.x)-13.3),abs(room.z-15.95))*6.6);
      floorTone *= 1.-.24*max(max(frontJoint,sideJoint),outerJoint);

      vec2 chassis = abs(ground-studioChassis.xy) / studioChassis.zw;
      float bellyShade = exp(-2.1*(pow(chassis.x,4.)+pow(chassis.y,4.)));
      float tireShade = 0.;
      for (int wheel=0;wheel<4;wheel++) {
        vec2 offsetFromTire=(ground-studioWheelTouch[wheel])/vec2(.153,.211);
        tireShade=max(tireShade,exp(-dot(offsetFromTire,offsetFromTire)));
      }
      float contact=(1.-.80*bellyShade*studioCarReady)*(1.-.89*tireShade*studioCarReady);

      // Roll the brightest glints off gently so the floor keeps its satin finish.
      float highlight = max(mirror.r,max(mirror.g,mirror.b));
      vec3 satinMirror = mirror/(1.+.78*highlight);
      vec3 groundBounce = satinMirror*(1.-smoothstep(1.8,5.65,radius));
      vec2 diffuseDistance = (ground-studioChassis.xy)/vec2(1.9,2.40);
      vec3 softBounce = studioPaint * .081 * exp(-dot(diffuseDistance,diffuseDistance)) * studioCarReady;
      float nearFixture = roomGlow(room.xz,vec2(studioLightBarX,.26),vec2(2.75,2.46));
      float reflectedBar = floorCornerReflection(vFloorPosition,cameraPosition,relief);
      vec3 fixtureBounce = cornerLightTint()*.041*reflectedBar;
      vec3 reflection = (groundBounce*.37*(1.-.48*nearFixture)
        + softBounce*.58 + fixtureBounce)*reflectionStrength;
      float cutPosition = room.z - 1.31 - (room.x-studioLightBarX)*.27;
      float localCut = smoothstep(studioLightBarX-6.3,studioLightBarX-4.8,room.x)
        * (1.-smoothstep(studioLightBarX-.15,studioLightBarX+.18,room.x));
      float groove = exp(-pow(cutPosition*51.,2.))*localCut;
      float cutLip = exp(-pow((cutPosition-.028)*67.,2.))*localCut;
      floorTone *= 1.-groove*.28+cutLip*.10;
      vec3 litFloor = (floorTone + reflection * mix(.89,1.10,relief)*(1.-groove*.30)) * contact;
      gl_FragColor.rgb = litFloor;
