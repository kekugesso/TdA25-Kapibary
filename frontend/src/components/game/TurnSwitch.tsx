"use client";

import { useState, useEffect } from "react";
import { Oicon, Xicon } from "./Icons";
import { useTheme } from "next-themes";

type TurnSwitchProps = {
  turn: string;
  changeAction: () => void;
};

export default function TurnSwitch({ turn, changeAction }: TurnSwitchProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isXturn, setIsXturn] = useState(false);
  const [isDelay, setIsDelay] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsXturn(turn === "X");
  }, [turn]);

  if (!mounted) return null;

  const handleToggle = () => {
    setIsXturn((prev) => !prev);
    setIsDelay(true);
    setTimeout(() => {
      changeAction();
      setIsDelay(false);
    }, 300);
  };

  return (
    <div className="flex items-center justify-center m-4">
      <input
        type="checkbox"
        checked={isXturn}
        disabled={isDelay}
        onChange={handleToggle}
        id="turn-switch"
        aria-label={`Switch turn to ${isXturn ? "O" : "X"}`}
        className="hidden"
      />
      <label
        htmlFor="turn-switch"
        className={`relative flex items-center justify-between w-[80px] h-[40px] p-1 rounded-lg shadow-md dark:shadow-sm shadow-gray-500 dark:shadow-black bg-white dark:bg-black transition-all duration-300 ${
          isDelay ? "cursor-default" : "cursor-pointer"
        }`}
      >
        <div
          className={`absolute w-[45%] h-[90%] top-[5%] left-[5%] rounded-lg transition-all duration-300 ${
            isXturn
              ? "translate-x-[100%] bg-red-light dark:bg-red-dark"
              : "translate-x-0 bg-blue-light dark:bg-blue-dark"
          }`}
        />
        <div className="w-[50%] h-[100%] flex flex-center">
          <Oicon
            turn="X"
            width={24}
            height={24}
            backgroundColor={theme === "dark" ? "#000000" : "#ffffff"}
            stroke={theme === "dark" ? "#395A9A" : "#0070BB"}
            strokeWidth={5}
            {...{ className: "z-10", viewBox: "0 -5 158 158" }}
          />
        </div>
        <div className="w-[50%] h-[100%] flex flex-center">
          <Xicon
            turn="O"
            width={24}
            height={24}
            backgroundColor={theme === "dark" ? "#000000" : "#ffffff"}
            stroke={theme === "dark" ? "#AB2E58" : "#E31838"}
            strokeWidth={5}
            {...{ className: "z-10", viewBox: "-5 -5 158 158" }}
          />
        </div>
      </label>
    </div>
  );
}
