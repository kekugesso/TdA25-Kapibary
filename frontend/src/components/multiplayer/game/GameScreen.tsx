import Board from "@/components/game/Board";
import { useGameManager } from "./GameManager";

export default function GameScreen({
  className = "flex flex-center flex-col h-full w-full",
}: {
  className?: string;
}) {
  const { isConnected, board, makeMove, surrender, draw, userType } =
    useGameManager();

  return (
    <div
      className={className}
      style={{ "--board-size": board.length } as React.CSSProperties}
    >
      <Board
        board={board}
        handleClick={makeMove}
        buttonClass={`[--size:calc(95vmin/var(--board-size))] md:[--size:5vmin] w-[--size] h-[--size] ${userType == "spectator" ? "cursor-default" : "cursor-pointer"}`}
      />
      {userType !== "spectator" && (
        <div className="mt-5 flex flex-row space-x-4 flex-center w-full md:[--size:5vmin] md:w-[calc(var(--size)*var(--board-size))] px-[1.5vw] md:px-0">
          <button
            className="bg-blue-light dark:bg-blue-dark text-white font-bold text-lg py-2 w-full sm:w-[50vmin] rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
            onClick={draw}
          >
            Nabídnout remízu
          </button>
          <button
            className="bg-red-light dark:bg-red-dark text-white font-bold text-lg py-2 w-full sm:w-[50vmin] rounded-lg shadow-black-light shadow-sm transform transition-all duration-300 ease-in-out hover:scale-105"
            onClick={surrender}
          >
            Vzdát se
          </button>
        </div>
      )}
      <div className="fixed bottom-0 right-0 p-1 opacity-50">
        <span className="text-gray-400 text-lg">
          {isConnected ? "Připojen" : "Odpojen"}
        </span>
      </div>
    </div>
  );
}
