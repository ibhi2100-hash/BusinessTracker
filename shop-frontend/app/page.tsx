"use client";

import React, { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Registered", reg))
        .catch((err) => console.error("SW Error", err));
    }
  }, []);

  return <div>page</div>;
};

export default Page;