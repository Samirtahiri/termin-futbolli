"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useClickLock(ms = 800) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const current = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const busy = useCallback((key: string) => busyKey === key, [busyKey]);

  const run = useCallback(
    (key: string, fn: () => void) => {
      if (current.current) return;
      current.current = key;
      setBusyKey(key);
      fn();
      const id = window.setTimeout(() => {
        if (current.current === key) {
          current.current = null;
          setBusyKey(null);
        }
      }, ms);
      timers.current.push(id);
    },
    [ms],
  );

  return { busy, run, locked: busyKey };
}
