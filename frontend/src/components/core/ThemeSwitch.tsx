"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isDelay, setIsDelay] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(theme === "dark");
  }, [theme]);
  if (!mounted) return null;

  const handleToggle = () => {
    setIsDark((prev) => !prev);
    setIsDelay(true);
    setTimeout(() => {
      setTheme((prev) => (prev === "light" ? "dark" : "light"));
      setIsDelay(false);
    }, 300);
  };

  return (
    <div className="flex flex-center">
      <input
        type="checkbox"
        checked={isDark}
        disabled={isDelay}
        onChange={handleToggle}
        id="theme-switch"
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        className="hidden"
      />
      <label
        htmlFor="theme-switch"
        className={`relative flex justify-items-center justify-between rounded-full bg-white dark:bg-black-dark border border-black-dark dark:border-white min-w-[71px] ${isDelay ? "cursor-default" : "cursor-pointer"}`}
      >
        <Image
          src="/img/moon.svg"
          alt="Moon Icon"
          width={20}
          height={20}
          className="m-2 invert"
        />
        <span
          className={`bg-white border-black dark:bg-black-dark dark:border-white absolute border-2 top-[5%] left-[3%] h-[90%] w-[44%] rounded-full transition-all duration-300 ${isDark ? "translate-x-[115%]" : "translate-x-0"}`}
        />
        <Image
          src="/img/sun.svg"
          alt="Sun Icon"
          width={20}
          height={20}
          className="m-2 text-black-dark"
        />
      </label>
    </div>
  );
}
