"use client";

import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import Image from "next/image";
import { useState } from "react";

export default function GameInviteModal({
  open,
  gameCode,
  cancelAction,
  joinAction,
}: {
  open: boolean;
  gameCode: number;
  cancelAction: () => void;
  joinAction: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>Pozvánka do hry</ModalHeader>
      <ModalBody className="flex flex-col w-full h-full">
        <div className="w-full h-full flex flex-center">
          <h2 className="text-sm text-center">
            Zkopírujte následující odkaz nebo kód {"'"}
            <b className="font-bold select-all">{gameCode}</b>
            {"'"} a pošlete jej kamarádovi, aby se mohl připojit do hry.
          </h2>
        </div>
        <div className="relative w-full h-full">
          <label htmlFor="gameLink">Odkaz:</label>
          <div
            id="gameLink"
            className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light select-all"
          >
            {`${window.location.host}/multiplayer?game=${gameCode}`}
          </div>
          <Image
            src="/img/copy_icon.svg"
            alt="copy"
            width={44}
            height={44}
            className="absolute right-0 top-[35%] p-3 cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out dark:invert"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.host}/multiplayer?game=${gameCode}`,
              );
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          />
          {copied && (
            <span className="absolute right-[-5%] top-[80%]">Zkopírováno!</span>
          )}
        </div>
      </ModalBody>
      <ModalFooter className="flex flex-center space-x-5 mt-5">
        <button
          onClick={joinAction}
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
