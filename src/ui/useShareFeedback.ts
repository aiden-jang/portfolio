import { useEffect, useRef, useState } from 'react';
import type { ShareResult } from '../browserSharing';

export function useShareFeedback(key: string, failureTimeout = 0) {
  const [result, setResult] = useState<ShareResult>(null);
  const version = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    version.current += 1;
    clearTimeout(timer.current);
    setResult(null);
    return () => {
      version.current += 1;
      clearTimeout(timer.current);
    };
  }, [key]);

  const run = async (action: () => Promise<ShareResult>): Promise<ShareResult> => {
    const request = ++version.current;
    clearTimeout(timer.current);
    setResult(null);
    const next = await action();
    if (request !== version.current) return null;
    setResult(next);
    const duration = next === 'failed' ? failureTimeout : 1800;
    if (next && duration) timer.current = setTimeout(() => setResult(null), duration);
    return next;
  };
  return { result, run };
}
