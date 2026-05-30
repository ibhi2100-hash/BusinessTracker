"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Registered", reg))
        .catch((err) => console.error("SW Error", err));
    }
  }, []);
  const router = useRouter();
  const handleRegister = () => {
    router.push("/register")
  }

  return(
  <div>
    <h1  className="text-3xl font-bold mb-4">Welcome to Business Tracker</h1>
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleRegister}>Get Started</button>
  </div>

  )

};

export default Page;