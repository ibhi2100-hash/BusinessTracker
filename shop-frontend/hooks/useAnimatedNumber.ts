// hooks/useAnimatedNumber.ts
"use client";

import { useEffect, useState } from "react";

export const useAnimatedNumber = (value: number, duration = 400) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    let start = display;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(start + (value - start) * progress);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return display;
};