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
import SaveModal from "./SaveModal";

export default function SaveGame() {
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);
  const [gameLocation, setGameLocation] = useState<string | null>(null);
  const [couldNotRedirect, setCouldNotRedirect] = useState(false);
  const [data, setData] = useState<GameData | null>(null);

  const isDataValid = (data: GameData) => {
    return data.board && data.difficulty && data.name;
  };

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
    setTimeout(() => setCouldNotRedirect(true), 5000);
    return data;
  };

  const dataError = (error: Error) => {
    console.log(error);
    setError(error);

    // nuke the data
    const location = localStorage.getItem("gameLocation");
    if (location && location !== "boardGame") localStorage.removeItem(location);
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
    else {
      const boardData = localStorage.getItem("boardData");
      if (boardData && isDataValid(JSON.parse(boardData))) saveGame();
      else if (boardData) {
        setData(JSON.parse(boardData));
        return;
      } else
        setError({
          name: "Data error",
          message: "No data to save",
        });

      localStorage.removeItem("boardData");
    }
  }, [saveGame, updateGame]);

  const handleClose = () => {
    const location = localStorage.getItem("gameLocation");
    localStorage.removeItem("gameLocation");
    router.push(
      location && location !== "boardGame"
        ? `/game/${location}/edit`
        : "/editor",
    );
  };

  const handleSave = (data: GameData) => {
    localStorage.setItem("boardData", JSON.stringify(data));
    setData(null);
    saveGame();
  };

  return (
    <>
      {data || ((isLoadingSave || isLoadingUpdate) && !couldNotRedirect) ? (
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
      {data && (
        <SaveModal
          dataSource={data}
          saveDataAction={handleSave}
          handleClose={handleClose}
        />
      )}
    </>
  );
}
