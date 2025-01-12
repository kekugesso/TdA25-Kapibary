"use client";

import Board from "@/components/game/Board";
import { useEffect, useRef, useState } from "react";
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
import { BoardType } from "@/types/board/BoardType";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";

type Error = {
  name: string;
  message: string;
  level: "normal" | "fatal";
};

export default function GameBoard({ data }: { data: GameData }) {
  const router = useRouter();
  const [game, setGame] = useState<GameData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [turn, setTurn] = useState<"X" | "O">("X");

  const deleteHandler = () => {
    if (!game) return;

    if (confirm("Opravdu chcete smazat tuto hru?")) {
      if (game.uuid) deleteGame();
      localStorage.clear();
      router.push("/games");
    }
  };

  const { mutate: deleteGame } = useMutation({
    mutationFn: () => fetch(`/api/games/${game?.uuid}`, { method: "DELETE" }),
    onError: (error) => {
      setError({
        name: "Delete error",
        message: error.message,
        level: "fatal",
      });
    },
  });

  const calcActualTurn = (board: BoardType) => {
    const xCount = board.flat().filter((x) => x === "X").length;
    const oCount = board.flat().filter((o) => o === "O").length;

    return xCount > oCount ? "O" : "X";
  };

  useEffect(() => {
    document.body.classList.add("disable-footer");
    return () => document.body.classList.remove("disable-footer");
  }, []);

  const dataUpdate = useRef(false);
  useEffect(() => {
    if (!data) return;
    if (dataUpdate.current) return;
    dataUpdate.current = true;

    setGame(data);
    localStorage.setItem("gameLocation", data.uuid || "boardData");
    setTurn(calcActualTurn(data.board));

    dataUpdate.current = false;
  }, [data, game]);

  const handleClick = (x: number, y: number) => {
    if (!game) return;

    const dataRow = game.board.at(y);
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

    game.board[y][x] = turn;
    setGame({ ...game });

    localStorage.setItem(game.uuid || "boardData", JSON.stringify(game));

    setTurn(turn === "X" ? "O" : "X");
  };

  return (
    <>
      {game && (
        <article className="flex flex-col mid:flex-row flex-center mid:justify-evenly p-[0.5vw]">
          <div className="flex mid:hidden flex-col items-center flex-center text-White font-bold text-3xl gap-5">
            Hraje
            <div className="flex gap-5">
              <Xicon turn={turn} width={50} height={50} />
              <Oicon turn={turn} width={58} height={58} />
            </div>
          </div>
          <div className="hidden mid:flex flex-col flex-center text-White font-bold text-6xl gap-5">
            <span className={turn === "X" ? "" : "opacity-0"}>Hraje</span>
            <Xicon turn={turn} width={150} height={150} />
          </div>

          <div className="flex flex-col items-center flex-center">
            <div className="flex justify-between text-2xl font-semibold dark:text-white text-black w-full">
              <p>{game.name}</p>
              <p>{DifficultyToString(game.difficulty)}</p>
            </div>
            <Board board={game.board} handleClick={handleClick} />
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
              <button
                onClick={deleteHandler}
                aria-label="Delete Button"
                className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-2 px-4 rounded-lg shadow-black-light shadow-sm flex flex-row gap-2 items-center"
              >
                <Image
                  src="/img/bin_delete.svg"
                  width={20}
                  height={20}
                  alt="bin"
                  className="dark:invert"
                />
                Delete
              </button>
            </div>
          </div>

          <div className="hidden mid:flex flex-col items-center flex-center text-White font-bold text-6xl gap-5">
            <span className={turn === "O" ? "" : "opacity-0"}>Hraje</span>
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
