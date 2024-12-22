"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={() => {
        if (!mounted) location.reload();
        else setTheme(theme === "light" ? "dark" : "light");
      }}
      className="text-lg font-semibold text-gray-800 hover:text-gray-900"
    >
      {theme === "light" ? "🌞" : "🌚"}
    </button>
  );
}
