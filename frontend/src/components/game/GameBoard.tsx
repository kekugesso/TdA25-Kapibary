"use client";

import { BoardData } from "@/types/game";
import Board from "@/components/game/Board";
import { useState } from "react";

export default function GameBoard({ board }: { board?: BoardData }) {
  const handleClick = (x: number, y: number) => {
    console.log(x, y);
  };

  const [turn, setTurn] = useState<"X" | "O">("X");

  return (
    board && (
      <article className="flex">
        <Board board={board.board} handleClick={handleClick} />
      </article>
    )
  );
}
