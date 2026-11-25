import { useEffect, useState } from 'react';

export function useSlowCarLoad(loading: boolean, index?: number) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    if (!loading) return;
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [loading, index]);
  return loading && visible;
}
