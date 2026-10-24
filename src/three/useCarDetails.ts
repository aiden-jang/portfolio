import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Object3D } from 'three';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';
import type { CarSpec, Lamp } from '../types';
import { createDRS, createHeadlightFlash } from './carDetails';

export function useCarDetails() {
  const { invalidate } = useThree();
  const drs = useRef<ReturnType<typeof createDRS>>(null);
  const flash = useRef<ReturnType<typeof createHeadlightFlash>>(null);
  const consumedFlash = useRef(useAppStore.getState().flashVersion);
  const drsOpen = useAppStore((state) => state.drsOpen);
  const flashVersion = useAppStore((state) => state.flashVersion);
  const release = useCallback(() => {
    drs.current?.dispose();
    flash.current?.dispose();
    drs.current = null;
    flash.current = null;
  }, []);
  const attach = useCallback((model: Object3D, spec: CarSpec, lamps: Lamp[]) => {
    consumedFlash.current = useAppStore.getState().flashVersion;
    drs.current = createDRS(model, spec.drs);
    flash.current = createHeadlightFlash(model, spec.flashMaterial, lamps);
    useAppStore.setState({ hasDRS: !!drs.current, hasFlashLights: !!flash.current });
  }, []);
  useEffect(() => {
    drs.current?.setOpen(drsOpen, prefersReducedMotion());
    invalidate();
  }, [drsOpen, invalidate]);
  useEffect(() => {
    invalidate();
  }, [flashVersion, invalidate]);
  useEffect(() => release, [release]);
  const update = useCallback(
    (dt: number) => {
      const state = useAppStore.getState();
      drs.current?.setOpen(state.drsOpen, prefersReducedMotion());
      drs.current?.update(dt);
      let triggered = false;
      if (state.flashVersion !== consumedFlash.current) {
        consumedFlash.current = state.flashVersion;
        if (state.flashActive) triggered = flash.current?.trigger(prefersReducedMotion()) ?? false;
      }
      // The first frame's delta includes idle time before the click, not pulse time.
      const active = triggered || (flash.current?.update(dt) ?? false);
      if (active) invalidate();
      if (state.flashActive && !active) useAppStore.setState({ flashActive: false });
    },
    [invalidate],
  );
  return { attach, release, update };
}
