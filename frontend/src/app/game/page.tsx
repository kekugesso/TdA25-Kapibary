"use client";

import { BoardData } from "@/types/game";
import { difficulty } from "@/types/search";
import GameBoard from "@/components/game/GameBoard";
import { useEffect, useState } from "react";
import Loading from "@/components/core/Loading";

export default function NewGame() {
  const [boardData, setBoardData] = useState<BoardData | null>();

  useEffect(() => {
    const savedBoardData = localStorage.getItem("boardData");

    if (savedBoardData) {
      setBoardData(JSON.parse(savedBoardData) as BoardData);
    } else {
      const initialBoardData: BoardData = {
        name: "Nová hra",
        difficulty: difficulty.beginner,
        board: Array.from({ length: 15 }, () => Array(15).fill("")),
      };

      localStorage.setItem("boardData", JSON.stringify(initialBoardData));
      setBoardData(initialBoardData);
    }
  }, []);

  return boardData ? <GameBoard board={boardData} /> : <Loading />;
}
