import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function GameContinueModal({
  open,
  joinAction,
  cancelAction,
}: {
  open: boolean;
  joinAction: () => void;
  cancelAction: () => void;
}) {
  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>Pokračovat ve hře</ModalHeader>
      <ModalBody className="flex flex-col items-center justify-center space-y-4">
        <p className="text-center text-lg text-gray-700 dark:text-gray-300">
          Vypadá to, že máš uloženou nedokončenou hru. Chceš pokračovat?
        </p>
      </ModalBody>
      <ModalFooter className="flex justify-center space-x-4">
        <button
          onClick={joinAction}
          className="bg-blue-light hover:bg-blue-dark text-white font-bold text-lg py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out"
        >
          Pokračovat
        </button>
        <button
          onClick={cancelAction}
          className="bg-red-light hover:bg-red-dark text-white font-bold text-lg py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out"
        >
          Zapomenout
        </button>
      </ModalFooter>
    </Modal>
  );
}
