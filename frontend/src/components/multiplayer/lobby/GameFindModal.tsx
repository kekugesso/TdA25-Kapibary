import Loading from "@/components/core/Loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function GameFindModal({
  open,
  cancelAction,
}: {
  open: boolean;
  cancelAction: () => void;
}) {
  return (
    <Modal open={open} onClose={cancelAction}>
      <ModalHeader>Matchmaking</ModalHeader>
      <ModalBody className="flex flex-center flex-col">
        <h2 className="text-sm text-center">Čekáme na dalšího hráče.</h2>
        <Loading height="min-h-full mt-2" />
      </ModalBody>
      <ModalFooter>
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
