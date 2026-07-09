"use client";

import { useEffect, useState } from "react";

export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNow(Date.now()));
    const interval = setInterval(() => setNow(Date.now()), intervalMs);
    return () => {
      cancelAnimationFrame(id);
      clearInterval(interval);
    };
  }, [intervalMs]);

  return now;
}
