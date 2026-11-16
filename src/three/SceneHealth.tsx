import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

export function SceneHealth() {
  const { gl } = useThree();
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const onLost = (event: Event) => {
      event.preventDefault();
      setLost(true);
    };
    gl.domElement.addEventListener('webglcontextlost', onLost);
    return () => gl.domElement.removeEventListener('webglcontextlost', onLost);
  }, [gl]);
  if (lost) throw new Error('The WebGL context was lost.');
  return null;
}
