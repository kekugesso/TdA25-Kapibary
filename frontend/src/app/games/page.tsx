"use client";

import { GameData } from "@/types/games/GameData";
import Loading from "@/components/core/Loading";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { DifficultyToString } from "@/types/search/difficulty";
import { useEffect, useState } from "react";
import {
  UpdatedAtFromStringDate,
  UpdatedAtToString,
} from "@/types/search/updatedAt";
import Image from "next/image";

export default function Game() {
  const router = useRouter();
  const [games, setGames] = useState<GameData[]>([]);

  const { isPending, error, data } = useQuery({
    queryKey: ["games"],
    queryFn: () =>
      fetch(`/api/games`)
        .then((res) => res.json())
        .then((data) => data as GameData[]),
  });

  useEffect(() => {
    if (data) {
      setGames(data);
    }
  }, [data]);

  const handleClose = () => router.back();

  return (
    <>
      {isPending && games ? (
        <Loading />
      ) : (
        <article className="flex flex-row sm:flex-row justify-around content-around flex-wrap">
          {games &&
            games.map((game) => (
              <div
                key={game.uuid}
                className="flex flex-col bg-black rounded-lg items-center justify-between h-fit overflow-hidden w-[280px]"
              >
                <div className="flex justify-between w-full h-fit bg-blue-light dark:bg-blue-dark">
                  <p className="p-3 text-2xl font-bold">{game.name}</p>
                  <Image
                    src={`/img/level_${game.difficulty}.svg`}
                    alt={game.name}
                    width={40}
                    height={40}
                    className="mx-3"
                  />
                </div>

                <p className="p-2 text-xl font-semibold self-start">
                  {DifficultyToString(game.difficulty)}
                </p>
                <p className="p-2 text-xl font-semibold self-start">
                  {UpdatedAtToString(UpdatedAtFromStringDate(game.updatedAt))}
                </p>
                <button
                  onClick={() => router.push(`/game/${game.uuid}`)}
                  className="w-[90%] m-2 text-xl bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
                >
                  Hrat
                </button>
              </div>
            ))}
        </article>
      )}
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
