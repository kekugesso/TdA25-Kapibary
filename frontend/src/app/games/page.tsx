"use client";

import { GameData } from "@/types/games/GameData";
import Loading from "@/components/core/Loading";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { useEffect, useState } from "react";
import Card from "@/components/games/Card";
import SearchBar from "@/components/games/SearchBar";
import { SearchQueryType } from "@/types/search/SearchQuery";
import { updatedAt } from "@/types/search/updatedAt";
import { difficulty } from "@/types/search/difficulty";

export default function Games() {
  const router = useRouter();
  const [games, setGames] = useState<GameData[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);

  // if we want to set a function it has to be a function that returns a function
  const [filterFunction, setFilterFunction] = useState<
    (data: GameData[]) => GameData[]
  >(() => (data: GameData[]) => data);

  const [filterParams, setFilterParams] = useState<SearchQueryType>({
    difficulty: [
      difficulty.beginner,
      difficulty.easy,
      difficulty.medium,
      difficulty.hard,
      difficulty.extreme,
    ],
    updatedAt: updatedAt["3months"],
  });

  useEffect(() => {
    if (!window) return;
    if (isBlocked) return;
    getGames();
  }, [filterParams, isBlocked]);

  const {
    mutate: getGames,
    isPending,
    error,
    data,
  } = useMutation({
    mutationKey: ["games"],
    mutationFn: () =>
      fetch(`/api/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filterParams),
      })
        .then((res) => res.json())
        .then((data) => data as GameData[]),
  });

  useEffect(() => {
    if (data) setGames(filterFunction(data));
  }, [data, filterFunction]);

  const handleSearch = (search: string, filter: SearchQueryType) => {
    setFilterParams(filter);

    // simple filter that checks if the name of the game includes the search string
    setFilterFunction(
      () => (data: GameData[]) =>
        data.filter((game) =>
          game.name.toLowerCase().includes(search.toLowerCase()),
        ),
    );
  };

  // // console function for search testing
  // useEffect(() => {
  //   if (window)
  //     window.manualSearch = function (search: string) {
  //       handleSearch(search, filterParams);
  //     };
  // }, [filterParams]);

  const handleClose = () => router.back();

  return (
    <>
      {isPending && games ? (
        <Loading />
      ) : (
        <article className="flex flex-col gap-4">
          <div className="flex justify-center m-5">
            <div className="w-[80vw]">
              <SearchBar
                searchAction={handleSearch}
                filterParams={filterParams}
                filterSetAction={setFilterParams}
                filterBlockAction={setIsBlocked}
                applyFilterAction={getGames}
              />
            </div>
          </div>
          <div
            className="flex flex-wrap justify-center gap-10 mb-10"
            aria-label="Games"
          >
            {games ? (
              games.map((game) => <Card key={game.uuid} game={game} />)
            ) : (
              <p className="self-center text-center text-balance font-medium">
                No games found.
              </p>
            )}
          </div>
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
