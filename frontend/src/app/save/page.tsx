"use client";

import { useMutation } from "@tanstack/react-query";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/core/Modal";
import Loading from "@/components/core/Loading";
import { GameData } from "@/types/games/GameData";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SaveGame() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [gameLocation, setGameLocation] = useState<string | null>(null);

  const mutateFn = async (location: string = "") => {
    const res = await fetch(`/api/games/${location}`, {
      method: location === "" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: localStorage.getItem(location === "" ? "boardData" : location),
    });

    if (res.status >= 300) throw await res.json();
    else return (await res.json()) as GameData;
  };

  const dataUpdate = (data: GameData) => {
    localStorage.setItem(data.uuid, JSON.stringify(data));
    localStorage.setItem("gameLocation", data.uuid);
    console.log(`Game saved as ${data.uuid}`);
    router.push(`/game/${data.uuid}`);
    return data;
  };

  const dataError = (error: Error) => {
    console.log(error);
    setError(error);
  };

  const { mutate: saveGame, isPending: isLoadingSave } = useMutation({
    throwOnError: false,
    mutationKey: ["saveGame"],
    mutationFn: () => mutateFn(),
    onSuccess: dataUpdate,
    onError: dataError,
  });

  const { mutate: updateGame, isPending: isLoadingUpdate } = useMutation({
    throwOnError: false,
    mutationKey: ["updateGame"],
    mutationFn: mutateFn,
    onSuccess: dataUpdate,
    onError: dataError,
  });

  useEffect(() => {
    const gameLocation = localStorage.getItem("gameLocation");
    setGameLocation(gameLocation);
    if (gameLocation && gameLocation !== "boardData") updateGame(gameLocation);
    else saveGame();
  }, [saveGame, updateGame]);

  const handleClose = () => router.back();

  return (
    <>
      {isLoadingSave || isLoadingUpdate || error !== null ? (
        <Loading />
      ) : (
        <article>
          You couln't be redirected{" "}
          <Link href={`/game/${gameLocation}`} className="underline text-blue">
            click here
          </Link>
          .
        </article>
      )}
      {error && (
        <Modal open={true} onClose={handleClose}>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message || "An error ocured while saving"}
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
