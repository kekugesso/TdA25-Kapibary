"use client";

import { useEffect } from "react";

export default function DissableFooter() {
  useEffect(() => {
    document.body.classList.add("disable-footer");
    return () => document.body.classList.remove("disable-footer");
  }, []);
  return <></>;
}
