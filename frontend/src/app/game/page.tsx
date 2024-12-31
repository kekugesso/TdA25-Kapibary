"use client";

import { BoardData } from "@/types/board/BoardData";
import { difficulty } from "@/types/search/difficulty";
import GameBoard from "@/components/game/GameBoard";
import { useEffect, useState } from "react";
import Loading from "@/components/core/Loading";

const CreateMatrix = (x: number, y: number) =>
  Array.from({ length: y }, () => Array(x).fill(""));

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
        board: CreateMatrix(15, 15),
      };

      localStorage.setItem("boardData", JSON.stringify(initialBoardData));
      setBoardData(initialBoardData);
    }
  }, []);

  return boardData ? <GameBoard /> : <Loading />;
}
