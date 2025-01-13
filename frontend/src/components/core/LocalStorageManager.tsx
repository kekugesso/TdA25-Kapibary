"use client";

import { useEffect } from "react";

export default function LocalStorageManager() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.length > 25) {
      // store important data
      const localGame = localStorage.getItem("boardData");
      const lastLocation = localStorage.getItem("gameLocation");
      const theme = localStorage.getItem("theme");

      // clear all data
      localStorage.clear();

      // restore important data
      if (localGame) localStorage.setItem("boardData", localGame);
      if (lastLocation) localStorage.setItem("gameLocation", lastLocation);
      if (theme) localStorage.setItem("theme", theme);
    }
  }, []);
  return <></>;
}
