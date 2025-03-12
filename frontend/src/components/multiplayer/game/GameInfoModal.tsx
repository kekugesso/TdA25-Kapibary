import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function GameInfoModal({
  open,
  title,
  description,
  closeAction,
}: {
  title: string;
  description: string;
  open: boolean;
  closeAction: () => void;
}) {
  return (
    <Modal open={open} onClose={closeAction}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody className="flex flex-center">{description}</ModalBody>
      <ModalFooter>
        <button
          onClick={closeAction}
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-3 px-6 rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Ok
        </button>
      </ModalFooter>
    </Modal>
  );
}
