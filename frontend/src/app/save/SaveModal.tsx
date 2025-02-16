import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { GameData } from "@/types/games/GameData";
import { difficulty, DifficultyToString } from "@/types/search/difficulty";
import { useState } from "react";

export default function SaveModal({
  dataSource,
  saveDataAction,
  handleClose,
}: {
  dataSource: GameData;
  saveDataAction: (data: GameData) => void;
  handleClose: () => void;
}) {
  const [data, setData] = useState<GameData>(dataSource);

  const handleSave = () => {
    if (!data.difficulty) data.difficulty = difficulty.beginner;
    saveDataAction(data);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <Modal open={true} onClose={handleClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <ModalHeader className="">
          <p className="text-2xl font-semibold">Uložit hru</p>
        </ModalHeader>
        <ModalBody className="mb-4 mt-1">
          <label htmlFor="name" className="block font-medium">
            Název
          </label>
          <input
            type="text"
            id="name"
            value={data.name || ""}
            onChange={handleChange}
            placeholder="Název hry"
            className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
            required
          />
          <label htmlFor="difficulty" className="block font-medium mt-1">
            Obtížnost
          </label>
          <select
            id="difficulty"
            value={data.difficulty || ""}
            onChange={handleChange}
            className="w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none focus:ring-1 focus:ring-blue-light"
            required
          >
            {Object.values(difficulty).map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DifficultyToString(difficulty)}
              </option>
            ))}
          </select>
        </ModalBody>
        <ModalFooter>
          <button
            type="submit"
            className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
          >
            Uložit
          </button>
          <button
            onClick={handleClose}
            className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
          >
            Neukládat
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
