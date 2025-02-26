import { useState } from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../core/Modal";

export default function BanModal({
  username,
  elo,
  onConfirm,
  onCancel,
}: {
  username: string;
  elo: number;
  onConfirm: (elo: number) => void;
  onCancel: () => void;
}) {
  const [newelo, setNewElo] = useState<number>(elo);

  return (
    <Modal open={true} onClose={onCancel}>
      <ModalHeader className="">
        <p className="text-2xl font-semibold">Úprava ela</p>
      </ModalHeader>
      <ModalBody className="flex flex-center flex-col">
        <div className="mb-4">Úprava ela hráče {username}.</div>
        <label htmlFor="name" className="block font-medium">
          Název
        </label>
        <input
          type="number"
          id="elo"
          value={newelo || ""}
          onChange={(e) => setNewElo(Number(e.target.value))}
          placeholder="Elo"
          className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
        />
      </ModalBody>
      <ModalFooter>
        <button
          onClick={() => onConfirm(newelo)}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Uložit
        </button>
        <button
          onClick={onCancel}
          className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
        >
          Neukládat
        </button>
      </ModalFooter>
    </Modal>
  );
}
