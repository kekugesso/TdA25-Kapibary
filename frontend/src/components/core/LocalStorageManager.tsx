"use client";

import { useEffect } from "react";

export default function LocalStorageManager() {
  const ClearLocalStorage = () => {
    // store important data
    const theme = localStorage.getItem("theme");
    const localGame = localStorage.getItem("boardData");
    const lastLocation = localStorage.getItem("gameLocation");
    let playingGame = null;
    if (lastLocation !== null && lastLocation !== "boardData")
      playingGame = localStorage.getItem(lastLocation);

    // clear all data
    localStorage.clear();

    // restore important data
    if (theme) localStorage.setItem("theme", theme);
    if (localGame) localStorage.setItem("boardData", localGame);
    if (lastLocation) localStorage.setItem("gameLocation", lastLocation);
    if (lastLocation && playingGame)
      localStorage.setItem(lastLocation, playingGame);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // window.clearLocalStorage = ClearLocalStorage;
    if (localStorage.length > 25) ClearLocalStorage();
  }, []);
  return <></>;
}
