"use client";
import { useEffect } from "react";
import { useBranchStore } from "@/store/useBranchStore";

export default function LoadBusinessContext() {
  const setContext = useBranchStore((s) => s.setContext);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/business/context`,
        { credentials: "include" }
      );

      const data = await res.json();
      console.log(data)
      setContext(data);
    };

    load();
  }, []);

  return null;
}
