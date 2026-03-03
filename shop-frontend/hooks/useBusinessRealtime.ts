// hooks/useBusinessRealtime.ts
"use client";

import { useEffect } from "react";

export const useBusinessRealtime = (
  onMessage: (data: any) => void
) => {
  useEffect(() => {
    const socket = new WebSocket(
      process.env.NEXT_PUBLIC_WS_URL as string
    );

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    return () => socket.close();
  }, []);
};