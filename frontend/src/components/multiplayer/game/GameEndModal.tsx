"use client";

import { Modal, ModalBody, ModalFooter } from "@/components/core/Modal";
import { Oicon, Xicon } from "@/components/game/Icons";

export default function GameEndModal({
  open,
  title,
  turn,
  description,
  rematchAction,
  closeAction,
}: {
  open: boolean;
  title: string;
  turn: "X" | "O";
  description: string;
  rematchAction: () => void;
  closeAction: () => void;
}) {
  function translateResult(result: string) {
    switch (result) {
      case "lose":
        return "Prohrál jsi!";
      case "win":
        return "Vyhrál jsi!";
      case "draw":
        return "Remíza!";
      default:
        return "Konec hry";
    }
  }
  return (
    <Modal open={open} onClose={closeAction}>
      <ModalBody className="flex flex-center flex-col w-full h-full py-[16px]">
        <div className="flex flex-center">
          <h1 className="text-5xl font-extrabold mr-3">
            {translateResult(title)}
          </h1>
          {turn === "X" ? (
            <Xicon turn={turn} width={82} height={82} />
          ) : (
            <Oicon turn={turn} width={82} height={82} />
          )}
        </div>
        <div className="flex flex-center">
          <p>{description}</p>
        </div>
      </ModalBody>
      <ModalFooter className="flex flex-center space-x-5 mt-5">
        <button
          onClick={closeAction}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-2 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          OK
        </button>
        <button
          onClick={rematchAction}
          className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-2 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
        >
          Odveta
        </button>
      </ModalFooter>
    </Modal>
  );
}
