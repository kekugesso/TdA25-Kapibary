"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { GameData } from "@/types/games/GameData";
import { DifficultyToString } from "@/types/search/difficulty";
import {
  UpdatedAtFromStringDate,
  UpdatedAtToString,
} from "@/types/search/updatedAt";

export default function Card({ game }: { game: GameData }) {
  const router = useRouter();

  return (
    <div key={game.uuid} aria-label="Game Card" className="flex flex-center">
      <div className="w-72 flex flex-col shadow-lg bg-white dark:bg-black rounded-lg items-center justify-between overflow-hidden">
        <div className="flex justify-between w-full h-fit bg-blue-light dark:bg-blue-dark">
          <p className="p-3 text-2xl font-bold text-white">{game.name}</p>
          <Image
            src={`/img/level_${game.difficulty}.svg`}
            alt={game.name}
            width={40}
            height={40}
            className="mx-3"
          />
        </div>

        <p className="px-3 py-2 text-xl font-semibold self-start">
          {DifficultyToString(game.difficulty)}
        </p>
        <p className="px-3 py-2 text-xl font-semibold self-start">
          {UpdatedAtToString(UpdatedAtFromStringDate(game.updatedAt))}
        </p>
        <div className="w-full flex flex-row justify-between">
          <button
            onClick={() => router.push(`/game/${game.uuid}/edit`)}
            className="w-full m-2 mr-1 text-xl bg-blue-light dark:bg-blue-dark text-white font-semibold rounded-lg py-2 px-6"
          >
            Editovat
          </button>
          <button
            onClick={() => router.push(`/game/${game.uuid}`)}
            className="w-full m-2 ml-1 text-xl bg-blue-light dark:bg-blue-dark text-white font-semibold rounded-lg py-2 px-6"
          >
            Hrát
          </button>
        </div>
      </div>
    </div>
  );
}
