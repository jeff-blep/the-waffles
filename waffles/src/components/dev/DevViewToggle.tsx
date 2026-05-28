// TODO: Remove this component before launch — dev-only view override.
"use client";

import { useState, useEffect } from "react";

type ViewMode = "chef" | "diner" | null;

export default function DevViewToggle() {
  const [current, setCurrent] = useState<ViewMode>(null);

  useEffect(() => {
    const stored = localStorage.getItem("waffles_devView");
    setCurrent(stored === "chef" || stored === "diner" ? stored : null);
  }, []);

  function switchTo(mode: ViewMode) {
    if (mode === null) {
      localStorage.removeItem("waffles_devView");
    } else {
      localStorage.setItem("waffles_devView", mode);
    }
    window.location.reload();
  }

  const options: { label: string; value: ViewMode }[] = [
    { label: "Chef",  value: "chef" },
    { label: "Diner", value: "diner" },
    { label: "Real",  value: null },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900/95 backdrop-blur text-white text-xs rounded-full px-4 py-2 shadow-xl border border-gray-700">
      <span className="text-yellow-400 font-bold tracking-wide">DEV</span>
      <span className="text-gray-500">|</span>
      <span className="text-gray-400">View as:</span>
      {options.map(({ label, value }) => (
        <button
          key={label}
          type="button"
          onClick={() => switchTo(value)}
          className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
            current === value
              ? "bg-orange-400 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
