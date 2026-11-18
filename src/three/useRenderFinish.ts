import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { MeshStandardMaterial, type Light, type Mesh, type Object3D } from 'three';
import { useAppStore } from '../store';

export function useRenderFinish(group: Object3D, underglow: Object3D) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const materials = new Map<Mesh, Mesh['material']>();
    const lights = new Map<Light, boolean>();
    let matte: MeshStandardMaterial | undefined;
    const restore = () => {
      for (const [mesh, material] of materials) mesh.material = material;
      for (const [light, visible] of lights) light.visible = visible;
      materials.clear();
      lights.clear();
      underglow.visible = true;
    };
    const unsubscribe = useAppStore.subscribe((state, previous) => {
      if (state.renderFinish === previous.renderFinish) return;
      restore();
      if (state.renderFinish === 'clay') {
        matte ??= new MeshStandardMaterial({
          color: 0xa4a29d,
          roughness: 0.94,
          metalness: 0.01,
        });
        const surface = matte;
        underglow.visible = false;
        group.traverse((object) => {
          const light = object as Light;
          if (!light.isLight) return;
          lights.set(light, light.visible);
          light.visible = false;
        });
        state.refs.carModel?.traverseVisible((object) => {
          const mesh = object as Mesh;
          if (!mesh.isMesh) return;
          materials.set(mesh, mesh.material);
          mesh.material = surface;
        });
      }
      invalidate();
    });
    return () => {
      unsubscribe();
      restore();
      matte?.dispose();
    };
  }, [group, invalidate, underglow]);
}
