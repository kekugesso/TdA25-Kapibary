"use client";

import Loading from "@/components/core/Loading";
import {
  GameManager,
  useGameManager,
} from "@/components/multiplayer/game/GameManager";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import { useEffect, useState } from "react";
import Board from "@/components/game/Board";

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
      <article>
        <GameInfo />
      </article>
    </GameManager>
  );
}

function GameInfo() {
  const { isLoading, isConnected, board, makeMove, surrender, draw, rematch } =
    useGameManager();

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          <h1>Game</h1>
          <p>Connected: {isConnected ? "Yes" : "No"}</p>
          <Board board={board} handleClick={makeMove} />
          <button onClick={surrender}>Surrender</button>
          <button onClick={draw}>Draw</button>
          <button onClick={rematch}>Rematch</button>
        </div>
      )}
    </div>
  );
}
