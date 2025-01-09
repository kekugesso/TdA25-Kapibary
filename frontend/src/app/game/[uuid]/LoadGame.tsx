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
import { GameData } from "@/types/games/GameData";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function LoadGame({ uuid }: { uuid: string }) {
  const router = useRouter();

  const { isPending, error, data } = useQuery({
    queryKey: ["gameBoard"],
    queryFn: () =>
      localStorage.getItem(uuid)
        ? (JSON.parse(localStorage.getItem(uuid) as string) as GameData)
        : fetch(`/api/games/${uuid}`)
            .then((res) => res.json())
            .then((data) => data as GameData),
  });

  const isData = useRef(false);
  useEffect(() => {
    if (!isData.current) {
      isData.current = true;
      console.log(uuid);
      if (data && !localStorage.getItem(uuid))
        localStorage.setItem(uuid, JSON.stringify(data));
    }
  }, [data, uuid]);

  const handleClose = () => router.back();

  return (
    <>
      {isPending && isData ? <Loading /> : <GameBoard data={uuid} />}
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
