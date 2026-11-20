import { prefersReducedMotion } from '../hooks/reducedMotion';
import { pairFrame } from '../garageExhibits/geometry';
import { useGarageExhibit } from '../garageExhibits/state';
import { useGarageStudy } from '../garageStudy/state';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Floor } from '../three/Floor';
import { getStudioProjection } from '../three/studio/projection';
import { studioSurfacesReady } from '../three/studio/textures';
import { ALIGNED_FRONT_AXLE, loadLineup, type LineupKind } from './models';
import { LineupRig } from './LineupRig';
import { useGarageStudio } from '../garageStudio/state';
import { useLineup } from './state';

type Models = Awaited<ReturnType<typeof loadLineup>>;

export function LineupScene() {
  const preview = useGarageStudio((state) => state.active);
  const kind: LineupKind = useGarageExhibit((state) => {
    if (!preview) return 'original';
    if (state.exhibit === 'wings' && state.shot === 2) return 'race';
    if (state.exhibit === 'porsche' && state.after) return state.aligned ? 'aligned' : 'porsche';
    return 'original';
  });
  const refined = useGarageStudy((state) => state.refined);
  const guides = useGarageStudio((state) => state.active && state.proposed && state.guides);
  const attempt = useLineup((state) => state.attempt);
  const [models, setModels] = useState<Models | null>(null);
  const mobile = useThree((state) => state.size.width < 768);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const controller = new AbortController();
    let loaded: Models | undefined;
    setModels(null);
    pairFrame.bounds.makeEmpty();
    pairFrame.cars = [];
    useLineup.setState({ status: 'loading' });
    void loadLineup(controller.signal, kind).then(
      (result) => {
        if (controller.signal.aborted) {
          result.dispose();
          return;
        }
        loaded = result;
        if (kind !== 'original') {
          pairFrame.cars = result.cars.map(({ bounds }) => bounds);
          pairFrame.bounds.copy(pairFrame.cars[0]).union(pairFrame.cars[1]);
        }
        setModels(result);
        invalidate();
      },
      () => {
        if (!controller.signal.aborted) useLineup.getState().fail();
      },
    );
    return () => {
      controller.abort();
      loaded?.dispose();
    };
  }, [attempt, invalidate, kind]);

  useEffect(() => {
    models?.tuneFerrari?.(true, getStudioProjection(mobile), preview && refined);
    models?.tuneRedBull?.(preview && refined);
    invalidate();
  }, [models, mobile, preview, refined, invalidate]);

  useFrame((_, dt) => {
    if (models?.wings.length) {
      const { pairWingOpen } = useGarageExhibit.getState();
      const immediate = prefersReducedMotion();
      for (const wing of models.wings) {
        wing?.setOpen(pairWingOpen, immediate);
        wing?.update(dt);
      }
    }
    const { status, ready } = useLineup.getState();
    if (models && status === 'loading' && studioSurfacesReady(mobile)) ready(models.cars[1].length);
  });

  const [ferrari, redBull] = models?.cars ?? [];
  return (
    <>
      <Floor studio lineup={ferrari && redBull ? [ferrari.footprint, redBull.footprint] : null} />
      {ferrari && redBull && (
        <>
          <primitive object={ferrari.group} />
          <primitive object={redBull.group} />
          {guides && kind === 'aligned' && (
            <mesh position={[0, 0.016, ALIGNED_FRONT_AXLE]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[5.5, 0.028]} />
              <meshBasicMaterial color="#ddc59f" transparent opacity={0.8} depthWrite={false} />
            </mesh>
          )}
          {kind === 'race' && (
            <>
              <directionalLight position={[2, 4, 3]} intensity={3.1} color="#fff0d8" />
              <directionalLight position={[-2, 2, -4]} intensity={1.3} color="#cfddff" />
            </>
          )}
          {guides && kind !== 'aligned' && <AxleMarks tires={ferrari.footprint.tires} />}
          {guides && kind !== 'aligned' && <AxleMarks tires={redBull.footprint.tires} />}
        </>
      )}
      {!preview && <LineupRig points={models?.points ?? []} />}
    </>
  );
}

function AxleMarks({ tires }: { tires: readonly { x: number; y: number }[] }) {
  return [0, 2].map((index) => {
    const a = tires[index],
      b = tires[index + 1];
    const z = (a.y + b.y) / 2;
    const sides = [Math.min(a.x, b.x) - 0.39, Math.max(a.x, b.x) + 0.39];
    return sides.map((x) => (
      <mesh key={x} position={[x, 0.013, z]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.35, 0.021]} />
        <meshBasicMaterial
          color="#edd19b"
          transparent
          opacity={0.82}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    ));
  });
}
