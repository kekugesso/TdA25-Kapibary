"use client";

import Loading from "@/components/core/Loading";
import { useGameManager } from "./GameManager";

export default function GameLoadingScreen({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useGameManager();

  return isLoading ? <Loading /> : <>{children}</>;
}
