import { Modal, ModalBody, ModalFooter, ModalHeader } from "../core/Modal";

export default function BanModal({
  username,
  onConfirm,
  onCancel,
}: {
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={true} onClose={onCancel}>
      <ModalHeader className="">
        <p className="text-2xl font-semibold">Ban</p>
      </ModalHeader>
      <ModalBody className="flex flex-center">
        Opravdu si hráč {username} zaslouží ban?
      </ModalBody>
      <ModalFooter>
        <button
          onClick={onConfirm}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Ano
        </button>
        <button
          onClick={onCancel}
          className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105 ml-4"
        >
          Ne
        </button>
      </ModalFooter>
    </Modal>
  );
}
