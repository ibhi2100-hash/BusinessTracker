"use client";

import { useKeypadStore } from "@/store/keypadStore";


const keys = ["1","2","3","4","5","6","7","8","9","0"];

export function Keypad() {
  const { mode,  value, input, backspace, clear, apply } =
    useKeypadStore();

  return (
    <div className="p-3 bg-gray-900 text-white">
      {/* DISPLAY */}
      <div className="text-xs text-gray-400 mb-1">
        {mode === "QUANTITY" ? "Enter Quantity" : "Enter Price"}
        </div>
      <div className="text-right text-3xl mb-3">
        {value || "0"}
      </div>

      {/* KEYS */}
      <div className="grid grid-cols-3 gap-2">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => input(k)}
            className="bg-gray-800 p-4 rounded-xl text-xl active:scale-95"
          >
            {k}
          </button>
        ))}

        <button
          onClick={clear}
          className="bg-red-600 p-4 rounded-xl"
        >
          C
        </button>

        <button
          onClick={backspace}
          className="bg-yellow-600 p-4 rounded-xl"
        >
          ⌫
        </button>

        <button
          onClick={apply}
          className="bg-green-600 p-4 rounded-xl"
        >
          OK
        </button>
      </div>
    </div>
  );
}