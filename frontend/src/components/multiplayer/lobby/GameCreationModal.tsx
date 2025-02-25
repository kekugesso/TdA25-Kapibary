import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import TurnSwitch from "@/components/game/TurnSwitch";
import { useState } from "react";

export default function GameCreationModal({
  open,
  createAction,
  cancelAction,
}: {
  open: boolean;
  createAction: (symbol: "X" | "O") => void;
  cancelAction: () => void;
}) {
  const [symbol, setSymbol] = useState<"X" | "O">("X");

  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>Matchmaking</ModalHeader>
      <ModalBody className="flex flex-center flex-col">
        <h2 className="text-sm">Za jaký znak chceš hrát?</h2>
        <TurnSwitch
          turn={symbol}
          changeAction={() => setSymbol((prev) => (prev === "X" ? "O" : "X"))}
        />
      </ModalBody>
      <ModalFooter>
        <button
          onClick={() => createAction(symbol)}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Create
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
