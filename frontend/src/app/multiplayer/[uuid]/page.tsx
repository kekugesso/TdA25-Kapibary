"use client";

import Loading from "@/components/core/Loading";
import { GameManager } from "@/components/multiplayer/game/GameManager";
import { useEffect, useState } from "react";
import GameLoadingScreen from "@/components/multiplayer/game/GameLoadingScreen";
import GameScreen from "@/components/multiplayer/game/GameScreen";
import UserInfo from "@/components/multiplayer/game/UserInfo";
import DissableFooter from "@/components/core/DissableFooter";

export default function MultiplayerGame({
  params,
}: {
  params: Promise<{ uuid: Promise<string> }>;
}) {
  const [uuid, setUuid] = useState<string | null>(null);
  useEffect(() => {
    async function loadGameCode() {
      try {
        const resolvedParams = await params;
        const resolvedUuid = await resolvedParams.uuid;
        if (resolvedUuid) setUuid(resolvedUuid);
      } catch (error) {
        console.error("Failed to load uuid:", error);
      }
    }
    loadGameCode();
  }, [params]);

  return !uuid ? (
    <Loading />
  ) : (
    <GameManager uuid={uuid}>
      <GameLoadingScreen>
        <article className="flex flex-col mid:flex-row">
          <span className="flex-1" />
          <UserInfo
            symbol="X"
            className="sm:hidden md:absolute md:opacity-0 mid:static mid:flex mid:opacity-100 md:flex-col flex-center transition-all duration-300 ease-in-out"
          />
          <span className="flex-1" />
          <GameScreen className="flex flex-center flex-col" />
          <span className="flex-1" />
          <UserInfo
            symbol="O"
            className="sm:hidden md:absolute md:opacity-0 mid:static mid:flex mid:opacity-100 md:flex-col flex-center transition-all duration-300 ease-in-out"
          />
          <span className="flex-1" />
        </article>
      </GameLoadingScreen>
      <DissableFooter />
    </GameManager>
  );
}
