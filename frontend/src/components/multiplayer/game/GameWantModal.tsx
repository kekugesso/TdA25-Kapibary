import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function GameWantModal({
  open,
  title,
  description,
  acceptAction,
  cancelAction,
}: {
  title: string;
  description: string;
  open: boolean;
  acceptAction: () => void;
  cancelAction: () => void;
}) {
  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody className="flex flex-center">{description}</ModalBody>
      <ModalFooter>
        <button
          onClick={acceptAction}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Ano
        </button>
        <button
          onClick={cancelAction}
          className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
        >
          Ne
        </button>
      </ModalFooter>
    </Modal>
  );
}
