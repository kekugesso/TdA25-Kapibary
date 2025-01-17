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
import { difficulty, DifficultyToString } from "@/types/search/difficulty";
import { GameData } from "@/types/games/GameData";
import TurnSwitch from "./TurnSwitch";

type Error = {
  name: string;
  message: string;
  level: "normal" | "fatal";
};

export default function Editor({ data }: { data: string }) {
  const router = useRouter();
  const [board, setBoard] = useState<GameData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [turn, setTurn] = useState<"X" | "O">("X");

  const calcActualTurn = (board: BoardData) => {
    const xCount = board.board.flat().filter((x) => x === "X").length;
    const oCount = board.board.flat().filter((o) => o === "O").length;

    return xCount > oCount ? "O" : "X";
  };

  useEffect(() => {
    document.body.classList.add("disable-footer");
    return () => document.body.classList.remove("disable-footer");
  }, []);

  useEffect(() => {
    if (!data) return;
    const savedBoardData = localStorage.getItem(data);
    localStorage.setItem("gameLocation", data);
    setTurn(savedBoardData ? calcActualTurn(JSON.parse(savedBoardData)) : "X");

    if (savedBoardData) setBoard(JSON.parse(savedBoardData) as GameData);
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
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { id, value } = e.target;
    setBoard(
      (prev) =>
        ({
          ...prev,
          [id]: value,
        }) as GameData,
    );
  };

  const handleSave = () => {
    if (!board) return;

    const boardData = JSON.stringify(board);
    localStorage.setItem(data, boardData);
    router.push("/save");
  };

  return (
    <>
      {board && (
        <article className="flex flex-col md:flex-row justify-evenly content-center items-center gap-5">
          <div className="flex flex-col gap-y-2 w-[90%] md:w-[30%]">
            <div>
              <label htmlFor="name" className="block font-medium">
                Název
              </label>
              <input
                type="text"
                id="name"
                value={board.name || ""}
                onChange={handleChange}
                placeholder="Název hry"
                className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
              />
            </div>
            <div>
              <label htmlFor="difficulty" className="block font-medium">
                Obtížnost
              </label>
              <select
                id="difficulty"
                value={board.difficulty || ""}
                onChange={handleChange}
                className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
              >
                {Object.values(difficulty).map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {DifficultyToString(difficulty)}
                  </option>
                ))}
              </select>
            </div>

            <TurnSwitch
              turn={turn}
              changeAction={() => setTurn((prev) => (prev === "X" ? "O" : "X"))}
            />

            <div className="flex flex-center gap-5">
              <button
                onClick={handleSave}
                aria-label="Save Button"
                className="bg-blue-light dark:bg-blue-dark text-white font-bold text-2xl py-2 px-4 rounded-lg shadow-black-light shadow-sm w-full"
              >
                Uložit
              </button>
              <button
                onClick={() =>
                  router.push(data !== "boardGame" ? `/game/${data}` : "/game")
                }
                aria-label="Dont Save Button"
                className="bg-red-light dark:bg-red-dark text-white font-bold text-2xl py-2 px-4 rounded-lg shadow-black-light shadow-sm w-full"
              >
                Neukládat
              </button>
            </div>
          </div>
          <Board board={board.board} handleClick={handleClick} />
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
