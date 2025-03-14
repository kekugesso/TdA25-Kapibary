import Loading from "@/components/core/Loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";

export default function GameDisconnectionModal({
  open,
  tries,
  retryAction,
}: {
  tries: number;
  open: boolean;
  retryAction: () => void;
}) {
  return (
    <Modal open={open} onClose={retryAction}>
      <ModalHeader>Odpojení</ModalHeader>
      <ModalBody className="flex items-center justify-center">
        <Loading height="min-h-[16px] mr-5" />
        <p className="text-center text-lg">
          Byl jsi odpojen od serveru. Zkontrolujte své připojení k internetu a
          zkuste to znovu. Pokušíme se vás připojit zpět, počet pokusů: {tries}
        </p>
      </ModalBody>
      <ModalFooter className="flex justify-center mt-4">
        <button
          onClick={retryAction}
          className="bg-blue-light hover:bg-blue-dark font-bold text-lg py-2 px-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out"
        >
          Zkusit znovu
        </button>
      </ModalFooter>
    </Modal>
  );
}
