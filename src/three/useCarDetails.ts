import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import type { Object3D } from 'three';
import { prefersReducedMotion } from '../hooks/reducedMotion';
import { useAppStore } from '../store';
import type { CarSpec } from '../types';
import { createDRS } from './carDetails';

export function useCarDetails() {
  const { invalidate } = useThree();
  const drs = useRef<ReturnType<typeof createDRS>>(null);
  const drsOpen = useAppStore((state) => state.drsOpen);
  const release = useCallback(() => {
    drs.current?.dispose();
    drs.current = null;
  }, []);
  const attach = useCallback((model: Object3D, spec: CarSpec) => {
    drs.current = createDRS(model, spec.drs);
    useAppStore.setState({ hasDRS: !!drs.current });
  }, []);
  useEffect(() => {
    drs.current?.setOpen(drsOpen, prefersReducedMotion());
    invalidate();
  }, [drsOpen, invalidate]);
  useEffect(() => release, [release]);
  const update = useCallback((dt: number) => {
    drs.current?.setOpen(useAppStore.getState().drsOpen, prefersReducedMotion());
    drs.current?.update(dt);
  }, []);
  return { attach, release, update };
}
