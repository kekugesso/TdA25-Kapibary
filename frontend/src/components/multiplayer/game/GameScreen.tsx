import Board from "@/components/game/Board";
import { useGameManager } from "./GameManager";

export default function GameScreen({
  className = "flex flex-center flex-col h-full w-full",
}: {
  className?: string;
}) {
  const { isConnected, board, makeMove, surrender, draw } = useGameManager();

  return (
    <div
      className={className}
      style={{ "--board-size": board.length } as React.CSSProperties}
    >
      <div className="text-sm text-center">
        {isConnected ? "Připojeno k serveru" : "Nepřipojen k serveru"}
      </div>
      <Board board={board} handleClick={makeMove} />
      <div className="mt-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-center [--size:calc(99vmin/var(--board-size))] md:[--size:5vmin] w-[calc(var(--size)*var(--board-size))]">
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
    </div>
  );
}
