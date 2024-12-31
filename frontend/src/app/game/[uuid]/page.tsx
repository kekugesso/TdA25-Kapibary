"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/core/Modal";
import Loading from "@/components/core/Loading";
import GameBoard from "@/components/game/GameBoard";
import { BoardData } from "@/types/board/BoardData";
import { useRouter } from "next/navigation";

export default function Game(uuid: string) {
  const router = useRouter();

  const { isPending, error, data } = useQuery({
    queryKey: ["gameBoard"],
    queryFn: () =>
      fetch(`/api/game/${uuid}`)
        .then((res) => res.json())
        .then((data) => data as BoardData),
  });

  const handleClose = () => router.back();

  return (
    <>
      {isPending ? <Loading /> : <GameBoard board={data} />}
      {error && (
        <Modal open={true} onClose={handleClose}>
          <ModalHeader>Error: {error.name}</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={handleClose}
              className="bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
            >
              Go back
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
