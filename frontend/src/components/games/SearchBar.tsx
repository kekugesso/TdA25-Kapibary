"use client";
import { GameData } from "@/types/games/GameData";
import { difficulty, DifficultyToString } from "@/types/search/difficulty";
import { SearchQueryType } from "@/types/search/SearchQuery";
import { updatedAt, UpdatedAtToString } from "@/types/search/updatedAt";
import { UseMutateFunction } from "@tanstack/react-query";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type SearchBarProps = {
  searchAction: (search: string, filter: SearchQueryType) => void;
  filterParams: SearchQueryType;
  filterSetAction: Dispatch<SetStateAction<SearchQueryType>>;
  filterBlockAction: Dispatch<SetStateAction<boolean>>;
  applyFilterAction: UseMutateFunction<GameData[], Error, void, unknown>;
};

export default function SearchBar({
  searchAction,
  filterParams,
  filterSetAction,
  filterBlockAction,
  applyFilterAction,
}: SearchBarProps) {
  // change radio buttons for updatedAt
  const handleUpdatedAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    filterSetAction((prev) => ({
      ...prev,
      updatedAt: e.target.value as keyof typeof updatedAt,
    }));
  };

  // checkboxes for difficulty
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as keyof typeof difficulty;
    const newDifficulties = filterParams.difficulty.includes(value)
      ? filterParams.difficulty.filter((d) => d !== value)
      : [...filterParams.difficulty, value];
    filterSetAction((prev) => ({
      ...prev,
      difficulty: newDifficulties,
    }));
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (dropdownOpen) filterBlockAction(true);
    else filterBlockAction(false);
  }, [dropdownOpen]);

  useEffect(() => {
    searchAction(search, filterParams);
  }, [search]);

  return (
    <div className="flex items-center space-x-2 rounded-full p-2 shadow-lg bg-white dark:bg-black text-black dark:text-white">
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:scale-110 transition-all focus:outline-none"
        >
          <Image
            src="/img/filter.svg"
            alt="Filter"
            width={24}
            height={24}
            className="dark:invert"
          />
        </button>

        {dropdownOpen && (
          <>
            <div className="absolute z-10 mt-2 border rounded-lg shadow-lg w-64 p-4 bg-white dark:bg-black text-black dark:text-white">
              <div key="Difficulty" className="mb-4">
                <p className="font-bold text-xl">Obtížnost</p>
                <ul>
                  {(Object.keys(difficulty) as (keyof typeof difficulty)[]).map(
                    (option) => (
                      <li key={option}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            value={option}
                            checked={filterParams.difficulty?.includes(option)}
                            onChange={handleDifficultyChange}
                          />
                          <span>{DifficultyToString(option)}</span>
                        </label>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div key="UpdatedAt" className="mb-4">
                <p className="font-bold text-xl">Datum poslední úpravy</p>
                <ul>
                  {(Object.keys(updatedAt) as (keyof typeof updatedAt)[]).map(
                    (option) => (
                      <li key={option}>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            className="form-radio"
                            value={option}
                            checked={filterParams.updatedAt === option}
                            onChange={handleUpdatedAtChange}
                          />
                          <span>{UpdatedAtToString(option)}</span>
                        </label>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
            <div
              id="overlay"
              className="fixed inset-0 bg-black bg-opacity-50 z-0"
              onClick={() => setDropdownOpen(false)}
            ></div>
          </>
        )}
      </div>

      <input
        type="text"
        placeholder="Hledat"
        className="flex-grow bg-transparent focus:outline-none text-gray-700"
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && searchAction(search, filterParams)
        }
      />

      <button
        onClick={() =>
          search ? searchAction(search, filterParams) : applyFilterAction()
        }
        className="flex items-center justify-center w-10 h-10 rounded-full hover:scale-110 transition-all focus:outline-none"
      >
        <Image
          src="/img/magnifying_glass.svg"
          alt="Search"
          width={32}
          height={32}
          className="dark:invert"
        />
      </button>
    </div>
  );
}
