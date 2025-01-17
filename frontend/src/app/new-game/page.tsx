"use client";

import Loading from "@/components/core/Loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { CreateMatrix } from "@/components/game/MatrixFunctions";
import { BoardData } from "@/types/board/BoardData";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function NewGame() {
  const router = useRouter();
  const [continueGame, setContinueGame] = useState(false);

  const CreateNewGame = useCallback(() => {
    const initialBoardData: BoardData = {
      name: null,
      difficulty: null,
      board: CreateMatrix(15, 15),
    };

    localStorage.setItem("boardData", JSON.stringify(initialBoardData));

    router.push("/game");
  }, [router]);

  useEffect(() => {
    if (localStorage.getItem("boardData")) setContinueGame(true);
    else CreateNewGame();
  }, [CreateNewGame]);

  return (
    <>
      <Loading />
      {continueGame && (
        <Modal open onClose={CreateNewGame}>
          <ModalHeader>
            <p className="text-2xl font-semibold">Pokračovat ve hře</p>
          </ModalHeader>
          <ModalBody>
            <p>
              Máte rozehranou hru. Chcete pokračovat ve hře nebo začít novou?
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
              onClick={() => CreateNewGame()}
            >
              Nová hra
            </button>
            <button
              className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
              onClick={() => router.push("/game")}
            >
              Pokračovat
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
