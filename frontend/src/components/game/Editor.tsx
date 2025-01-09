"use client";

import { BoardData } from "@/types/board/BoardData";
import Board from "@/components/game/Board";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/core/Modal";
import { useRouter } from "next/navigation";
import { DifficultyToString } from "@/types/search/difficulty";
import { Oicon, Xicon } from "@/components/game/Icons";
import { GameData } from "@/types/games/GameData";

type Error = {
  name: string;
  message: string;
  level: "normal" | "fatal";
};

export default function Editor({ data }: { data: string }) {
  const router = useRouter();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [turn, setTurn] = useState<"X" | "O">("X");

  const calcActualTurn = (board: BoardData) => {
    const xCount = board.board.flat().filter((x) => x === "X").length;
    const oCount = board.board.flat().filter((o) => o === "O").length;

    return xCount > oCount ? "O" : "X";
  };

  document.body.classList.add("disable-footer");

  useEffect(() => {
    if (!data) return;
    const savedBoardData = localStorage.getItem(data);
    localStorage.setItem("gameLocation", data);
    setTurn(savedBoardData ? calcActualTurn(JSON.parse(savedBoardData)) : "X");

    if (savedBoardData)
      setBoard(JSON.parse(savedBoardData) as BoardData | GameData);
    else
      setError({
        name: "Data error",
        message: "Couldn't get data from local storage",
        level: "fatal",
      });
  }, [data]);

  const handleClick = (x: number, y: number) => {
    if (!board) return;

    const dataRow = board.board.at(y);
    if (dataRow === undefined) {
      setError({
        name: "Index error",
        message: `Got the board row data as "undefined" for ${y},${x}`,
        level: "normal",
      });
      return;
    }
    const positionData = dataRow.at(x);
    if (positionData === undefined) {
      setError({
        name: "Index error",
        message: `Got the board column data as "undefined" for ${y},${x}`,
        level: "normal",
      });
      return;
    }

    if (positionData !== "") return;

    board.board[y][x] = turn;
    setBoard({ ...board });

    localStorage.setItem(data, JSON.stringify(board));
  };

  return (
    <>
      {board && (
        <article className="flex flex-col md:flex-row flex-center sm:justify-evenly p-[0.5vw]">
          <Board board={board.board} handleClick={handleClick} />
          <div className="flex justify-center gap-2 py-2">
            <button
              onClick={() => router.push("/save")}
              aria-label="Save Button"
              className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-2 px-4 rounded-lg shadow-black-light shadow-sm"
            >
              Uložit
            </button>
            <button
              onClick={() => router.push("/editor")}
              aria-label="Edit Button"
              className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-2 px-4 rounded-lg shadow-black-light shadow-sm"
            >
              Upravit
            </button>
          </div>
        </article>
      )}
      {error && (
        <Modal
          open={true}
          onClose={
            error.level == "fatal"
              ? () => router.push("/")
              : () => setError(null)
          }
        >
          <ModalHeader>Error: {error.name}</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={
                error.level == "fatal"
                  ? () => router.push("/")
                  : () => setError(null)
              }
              className="bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
            >
              ok
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
