"use client";

import Loading from "@/components/core/Loading";
import { CreateMatrix } from "@/components/game/MatrixFunctions";
import { BoardData } from "@/types/board/BoardData";
import { difficulty } from "@/types/search/difficulty";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NewGame() {
  const router = useRouter();
  useEffect(() => {
    const initialBoardData: BoardData = {
      name: "Nová hra",
      difficulty: difficulty.beginner,
      board: CreateMatrix(15, 15),
    };

    localStorage.setItem("boardData", JSON.stringify(initialBoardData));

    router.push("/game");
  }, []);

  return <Loading />;
}
