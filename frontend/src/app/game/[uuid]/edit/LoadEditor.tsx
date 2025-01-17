"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/core/Modal";
import Loading from "@/components/core/Loading";
import { GameData } from "@/types/games/GameData";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoadEditor({ uuid }: { uuid: string }) {
  const router = useRouter();

  const getGame = (uuid: string) => {
    const localData = window.localStorage.getItem(uuid);
    if (localData) return JSON.parse(localData) as GameData;
    else
      return fetch(`/api/games/${uuid}`)
        .then((res) => res.json())
        .then((data) => data as GameData);
  };

  const { error, data } = useQuery({
    queryKey: ["gameBoard"],
    queryFn: () => getGame(uuid),
  });

  useEffect(() => {
    if (data) {
      localStorage.setItem(uuid, JSON.stringify(data));
      localStorage.setItem("gameLocation", uuid);
      router.push("/editor");
    }
  }, [data, uuid, router]);

  const handleClose = () => router.back();

  return (
    <>
      <Loading />
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
