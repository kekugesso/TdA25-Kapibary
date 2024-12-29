"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure the component is only rendered on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle cases where the component renders before hydration
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div className="flex flex-center">
      <input
        type="checkbox"
        checked={isDark}
        onChange={() =>
          setTheme((prev) => (prev === "light" ? "dark" : "light"))
        }
        id="theme-switch"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="hidden"
      />
      <label
        htmlFor="theme-switch"
        className="relative cursor-pointer flex justify-items-center justify-between bg-white rounded-full"
      >
        <Image
          src="/img/moon.svg"
          alt="Moon Icon"
          width={20}
          height={20}
          className="m-2"
        />
        <span className="bg-white border-black absolute top-[5%] left-[4%] border-2 w-8 h-8 rounded-full transition-all duration-300 dark:translate-x-[105%]" />
        <Image
          src="/img/sun.svg"
          alt="Sun Icon"
          width={20}
          height={20}
          className="m-2"
        />
      </label>
    </div>
  );
}
