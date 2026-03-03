// hooks/useLongPress.ts
"use client";

import { useRef } from "react";

export const useLongPress = (
  onLongPress: () => void,
  onClick: () => void,
  ms = 450
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggered = useRef(false);

  const start = () => {
    longPressTriggered.current = false;

    timerRef.current = setTimeout(() => {
      onLongPress();
      longPressTriggered.current = true;
    }, ms);
  };

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!longPressTriggered.current) onClick();
  };

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
};