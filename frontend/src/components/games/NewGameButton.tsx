"use client";

import { BoardData } from "@/types/board/BoardData";
import { useEffect, useState } from "react";
import { CreateMatrix } from "../game/MatrixFunctions";
import { difficulty } from "@/types/search/difficulty";
import { useRouter } from "next/navigation";

export default function NewGameButton() {
  const router = useRouter();

  const CreateNewGame = () => {
    const initialBoardData: BoardData = {
      name: "Nová hra",
      difficulty: difficulty.beginner,
      board: CreateMatrix(15, 15),
    };

    localStorage.setItem("boardData", JSON.stringify(initialBoardData));
  };

  const CreateAndPlay = () => {
    CreateNewGame();
    router.push("/game");
  };

  const CreateAndEdit = () => {
    CreateNewGame();
    router.push("/editor");
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsOpen(true), 300);
  };

  useEffect(() => {
    if (!window) return;
    if (!isOpen) return;
    window.addEventListener("scroll", () => {
      setIsAnimating(false);
      setIsOpen(false);
    });

    return () => {
      window.removeEventListener("scroll", () => {
        setIsAnimating(false);
        setIsOpen(false);
      });
    };
  }, [isOpen]);

  return (
    <div className="flex flex-row flex-center rounded-lg bg-gradient-to-tr from-blue-light to-blue-dark">
      <button
        onClick={isOpen ? CreateAndEdit : handleClick}
        className={`h-[50px] flex text-white font-medium transition-[width] duration-300 shadow-xl items-center
          ${!isAnimating && !isOpen ? "w-[50px] flex-center" : ""}
          ${isAnimating && !isOpen ? "w-[300px] overflow-hidden delay-75 px-[10px]" : ""}
          ${isAnimating && isOpen ? "w-[180px] transition-none justify-center" : ""}
`}
      >
        <svg
          width="29"
          height="28"
          viewBox="0 0 39 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform transform duration-300 ease-in-out ${
            isAnimating ? "-rotate-90" : "rotate-0"
          } ${isOpen ? "mr-[10px]" : ""}`}
        >
          <path
            d="M19.5308 37.36C18.3788 37.36 17.3548 37.072 16.4588 36.496C15.6268 35.856 15.2108 35.056 15.2108 34.096V22.96H4.07475C3.11475 22.96 2.31475 22.576 1.67475 21.808C1.09875 20.976 0.81075 19.952 0.81075 18.736C0.81075 17.52 1.09875 16.496 1.67475 15.664C2.31475 14.832 3.11475 14.416 4.07475 14.416H15.2108V3.376C15.2108 2.544 15.6268 1.776 16.4588 1.072C17.3548 0.367997 18.3788 0.0159969 19.5308 0.0159969C20.8108 0.0159969 21.8348 0.367997 22.6028 1.072C23.3708 1.776 23.7548 2.544 23.7548 3.376V14.416H34.7948C35.6908 14.416 36.4908 14.832 37.1948 15.664C37.8988 16.496 38.2508 17.52 38.2508 18.736C38.2508 19.952 37.8988 20.976 37.1948 21.808C36.4908 22.576 35.6908 22.96 34.7948 22.96H23.7548V34.096C23.7548 35.056 23.3708 35.856 22.6028 36.496C21.8348 37.072 20.8108 37.36 19.5308 37.36Z"
            fill="white"
          />
        </svg>
        {isOpen && (
          <span className="text-2xl animate-fade-left animate-duration-150">
            Vytvořit hru
          </span>
        )}
      </button>
      {isOpen && (
        <button
          onClick={isOpen ? CreateAndPlay : handleClick}
          className="h-[50px] w-[110px] flex flex-center text-white font-medium shadow-xl items-center border-l border-white"
        >
          <span className="text-2xl animate-fade-right animate-duration-150">
            Nová hra
          </span>
        </button>
      )}
    </div>
  );
}
