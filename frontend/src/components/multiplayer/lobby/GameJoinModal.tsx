import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { useState } from "react";

export default function GameJoinModal({
  open,
  cancelAction,
  joinAction,
}: {
  open: boolean;
  cancelAction: () => void;
  joinAction: (code: number) => void;
}) {
  const [gameCode, setGameCode] = useState<string>("");
  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>Zadejte kód</ModalHeader>
      <ModalBody className="flex flex-col w-full h-full">
        <div className="w-full h-full flex flex-center">
          <h2 className="text-sm">
            Pro připojení do již existující herní místnosti zadejte kód.
          </h2>
        </div>
        <div className="w-full h-full">
          <label htmlFor="gameCode">Kód:</label>
          <input
            type="text"
            placeholder="Kód..."
            id="gameCode"
            className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter className="flex flex-center space-x-5 mt-5">
        <button
          onClick={() => joinAction(Number.parseInt(gameCode))}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Připojit se
        </button>
        <button
          onClick={cancelAction}
          className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
        >
          Zrušit
        </button>
      </ModalFooter>
    </Modal>
  );
}
