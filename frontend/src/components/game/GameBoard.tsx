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

type Error = {
  name: string;
  message: string;
  level: "normal" | "fatal";
};

export default function GameBoard() {
  const router = useRouter();
  const [board, setBoard] = useState<BoardData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [turn, setTurn] = useState<"X" | "O">("X");

  document.body.classList.add("disable-footer");

  useEffect(() => {
    const savedBoardData = localStorage.getItem("boardData");

    if (savedBoardData) setBoard(JSON.parse(savedBoardData) as BoardData);
    else
      setError({
        name: "Data error",
        message: "Couldn't get data from local storage",
        level: "fatal",
      });
  }, []);

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

    localStorage.setItem("boardData", JSON.stringify(board));

    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <>
      {board && (
        <article className="flex flex-col sm:flex-row flex-center sm:justify-evenly p-[0.5vw]">
          <div className="flex sm:hidden flex-col items-center flex-center text-White font-bold text-3xl gap-5">
            Hraje
            <div className="flex gap-5">
              <Xicon turn={turn} width={50} height={50} />
              <Oicon turn={turn} width={58} height={58} />
            </div>
          </div>
          <div className="hidden sm:flex flex-col flex-center text-White font-bold text-6xl gap-5">
            Hraje
            <Xicon turn={turn} width={150} height={150} />
          </div>

          <div className="flex flex-col items-center flex-center">
            <div className="flex justify-between text-2xl font-semibold dark:text-white text-black w-full">
              <p>{board.name}</p>
              <p>{DifficultyToString(board.difficulty)}</p>
            </div>
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
          </div>

          <div className="hidden sm:flex flex-col items-center flex-center text-White font-bold text-6xl gap-5">
            Hraje
            <Oicon turn={turn} width={158} height={158} />
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
