import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Floor } from '../three/Floor';
import { getStudioProjection } from '../three/studio/projection';
import { studioSurfacesReady } from '../three/studio/textures';
import { loadLineup } from './models';
import { LineupRig } from './LineupRig';
import { useLineup } from './state';

type Models = Awaited<ReturnType<typeof loadLineup>>;

export function LineupScene() {
  const attempt = useLineup((state) => state.attempt);
  const [models, setModels] = useState<Models | null>(null);
  const mobile = useThree((state) => state.size.width < 768);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const controller = new AbortController();
    let loaded: Models | undefined;
    void loadLineup(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) {
          result.dispose();
          return;
        }
        loaded = result;
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
  }, [attempt, invalidate]);

  useEffect(() => {
    models?.tuneFerrari(true, getStudioProjection(mobile));
  }, [models, mobile]);

  useFrame(() => {
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
        </>
      )}
      <LineupRig points={models?.points ?? []} />
    </>
  );
}
