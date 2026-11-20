      vec2 sceneUv = vUv.xy / vUv.w;
      vec2 ground = vFloorPosition.xz;
      float radius = length(ground);
      vec2 fromBody = abs(ground - studioChassis.xy);
      vec2 underCar = studioChassis.zw * vec2(1.04, 1.18);
      float fromFootprint = length(max(fromBody - underCar, vec2(0.)));
      if (studioSecondReady > 0.5) {
        vec2 secondBody = abs(ground - studioSecondChassis.xy);
        vec2 secondUnder = studioSecondChassis.zw * vec2(1.04, 1.18);
        fromFootprint = min(fromFootprint, length(max(secondBody - secondUnder, vec2(0.))));
      }
      float satinFalloff = smoothstep(.06,1.72,fromFootprint);
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
      vec2 roughnessOffset = (grainTilt*vec2(.065,.091)
        + vec2(fine-coarse,.0771-fine)*.033) * mix(.26,1.,satinFalloff);
      float scatter = mix(.72,4.35,satinFalloff) + (1.-relief)*.72;
      vec2 offset = mix(vec2(.0007,.002),vec2(.005,.013),satinFalloff);
      sceneUv += roughnessOffset;
      vec3 mirror = texture2D(tDiffuse, sceneUv, scatter).rgb * .56;
      mirror += texture2D(tDiffuse, sceneUv + offset, scatter + .24).rgb * .11;
      mirror += texture2D(tDiffuse, sceneUv - offset, scatter + .24).rgb * .11;
      mirror += texture2D(tDiffuse, sceneUv + vec2(-offset.x,offset.y), scatter + .24).rgb * .11;
      mirror += texture2D(tDiffuse, sceneUv + vec2(offset.x,-offset.y), scatter + .24).rgb * .11;
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
      // The camera sees more of the sheen when its view grazes the cured concrete.
      vec3 toEye = normalize(cameraPosition - vFloorPosition);
      float grazing = 1.-smoothstep(.10,.49,max(0.,toEye.y));
      vec2 fromSoftbox = ground - vec2(2.57,.43);
      float softboxAcross = dot(fromSoftbox, normalize(vec2(.991,-.134)));
      float softboxAlong = dot(fromSoftbox, normalize(vec2(.134,.991)));
      vec2 streakShape = vec2((softboxAcross+.07*softboxAlong)/.94,softboxAlong/3.48);
      float grazingStreak = exp(-dot(streakShape,streakShape));
      float spillSheen = grazingStreak*(.23+.77*grazing)*mix(.72,1.16,relief);
      litConcrete += vec3(.036,.033,.029)*spillSheen;
      vec3 floorTone = litConcrete * relief * topcoat * floorDarkening;
      float frontJoint = exp(-abs(room.z)*6.6) * (1.-smoothstep(studioLightBarX-.03,studioLightBarX+.24,room.x));
      float sideJoint = exp(-abs(room.x-studioLightBarX)*6.6) * smoothstep(0.,.14,room.z);
      float outerJoint = exp(-min(abs(abs(room.x)-13.3),abs(room.z-15.95))*6.6);
      floorTone *= 1.-.24*max(max(frontJoint,sideJoint),outerJoint);

      vec2 chassis = fromBody / studioChassis.zw;
      float bellyShade = exp(-1.90*(pow(chassis.x,4.)+pow(chassis.y,4.)));
      float tireCore = 0.;
      float tireAmbient = 0.;
      for (int wheel=0;wheel<4;wheel++) {
        vec2 tireOffset = ground - studioWheelTouch[wheel];
        vec2 core = tireOffset/vec2(.108,.154);
        vec2 broad = (tireOffset+vec2(.074,-.025))/vec2(.23,.295);
        tireCore = max(tireCore,exp(-dot(core,core)));
        tireAmbient = max(tireAmbient,exp(-dot(broad,broad)));
      }
      float contact = (1.-.72*bellyShade*studioCarReady)
        * (1.-min(.96,.89*tireCore+.34*tireAmbient)*studioCarReady);

      if (studioSecondReady > 0.5) {
        vec2 second = abs(ground - studioSecondChassis.xy) / studioSecondChassis.zw;
        float secondBelly = exp(-1.90*(pow(second.x,4.)+pow(second.y,4.)));
        float secondTireCore = 0.;
        float secondTireAmbient = 0.;
        for (int wheel=0;wheel<4;wheel++) {
          vec2 tireOffset = ground - studioSecondTouch[wheel];
          vec2 core = tireOffset/vec2(.137,.174);
          vec2 broad = (tireOffset+vec2(.074,-.025))/vec2(.25,.32);
          secondTireCore = max(secondTireCore,exp(-dot(core,core)));
          secondTireAmbient = max(secondTireAmbient,exp(-dot(broad,broad)));
        }
        contact *= (1.-.72*secondBelly) * (1.-min(.96,.89*secondTireCore+.34*secondTireAmbient));
      }

      // Keep the image of the lower body near its contact edge, then let the grain scatter it.
      float highlight = max(mirror.r,max(mirror.g,mirror.b));
      vec3 satinMirror = mirror/(1.+.89*highlight);
      float concreteBreakup = mix(1.,clamp(.71+fine*3.3+coarse*2.1,.65,1.16),satinFalloff);
      float rimFade = 1.-smoothstep(.60,2.58,fromFootprint);
      vec3 groundBounce = satinMirror * rimFade * concreteBreakup;
      vec2 diffuseDistance = (ground-studioChassis.xy)/vec2(1.9,2.40);
      vec3 softBounce = studioPaint * .081 * exp(-dot(diffuseDistance,diffuseDistance)) * studioCarReady;
      float nearFixture = roomGlow(room.xz,vec2(studioLightBarX,.26),vec2(2.75,2.46));
      float reflectedBar = floorCornerReflection(vFloorPosition,cameraPosition,relief);
      vec3 fixtureBounce = cornerLightTint()*.041*reflectedBar;
      float clearCoat = mix(.62,.37,satinFalloff) * mix(.78,1.05,grazing);
      vec3 reflection = (groundBounce*clearCoat*(1.-.37*nearFixture)
        + softBounce*.34 + fixtureBounce)*reflectionStrength;
      float cutPosition = room.z - 1.31 - (room.x-studioLightBarX)*.27;
      float localCut = smoothstep(studioLightBarX-6.3,studioLightBarX-4.8,room.x)
        * (1.-smoothstep(studioLightBarX-.15,studioLightBarX+.18,room.x));
      float groove = exp(-pow(cutPosition*51.,2.))*localCut;
      float cutLip = exp(-pow((cutPosition-.028)*67.,2.))*localCut;
      floorTone *= 1.-groove*.28+cutLip*.10;
      floorTone *= mix(1., .30, garageStudioDim);
      floorTone += cornerLightTint() * .045 * reflectedBar * garageStudioDim;
      vec2 lampDist = vec2((abs(ground.x) - .64)/.52,(ground.y - 3.22)/1.25);
      float pools = exp(-dot(lampDist,lampDist)) * smoothstep(1.95,2.39,ground.y);
      floorTone += vec3(.072,.064,.047) * garageStudioLamps * pools * relief;
      reflection *= mix(1., .76 + .12 * (1. - satinFalloff), garageStudioLow);
      vec2 shaft = vec2(dot(ground,vec2(.83,.56)),dot(ground,vec2(-.56,.83)));
      float duskSoftEdge = exp(-pow((shaft.y+.18)/.81,2.));
      float duskDistance = smoothstep(-5.,-.25,shaft.x)*(1.-smoothstep(2.0,7.,shaft.x));
      float duskSpill = duskSoftEdge * duskDistance * mix(.75,1.13,relief);
      floorTone *= mix(vec3(1.),vec3(.79,.59,.48),studioDusk);
      floorTone += vec3(.27,.125,.039) * duskSpill * studioDusk;
      floorTone += vec3(.129,.05,.012) * reflectedBar * studioDusk;
      vec3 litFloor = (floorTone + reflection * mix(.89,1.10,relief)*(1.-groove*.30)) * contact;
      if (garageStudioPass > .9 && garageStudioPass < 1.1) {
        vec3 paper = vec3(.19,.18,.16);
        litFloor = paper * mix(.57,1.,carArea) * (0.12 + .88 * contact);
      }
      if (garageStudioPass > 1.9) {
        litFloor = vec3(.004,.004,.004) + satinMirror * rimFade * .87 * contact;
      }
      gl_FragColor.rgb = litFloor;
