"use client";

import { BoardData } from "@/types/board/BoardData";
import { difficulty } from "@/types/search/difficulty";
import GameBoard from "@/components/game/GameBoard";
import { useEffect, useState } from "react";
import Loading from "@/components/core/Loading";
import { CreateMatrix } from "@/components/game/MatrixFunctions";

export default function Game() {
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
