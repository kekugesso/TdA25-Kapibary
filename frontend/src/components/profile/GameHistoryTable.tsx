import { User } from "@/types/auth/user";
import { Oicon, Xicon } from "../game/Icons";
import Link from "next/link";
import { GameHistory } from "@/types/multiplayer/GameHistory";
import { GameResult } from "@/types/multiplayer/GameResult";
import { useTheme } from "next-themes";

export default function GameHistoryTable({
  userData,
  gameHistory,
}: {
  userData: User;
  gameHistory: GameHistory[];
}) {
  const { theme } = useTheme();
  const getResult = (game: GameHistory) => {
    switch (game.result) {
      case GameResult.WIN:
        return game.symbol === "X" ? "1 : 0" : "0 : 1";
      case GameResult.LOSE:
        return game.symbol === "X" ? "0 : 1" : "1 : 0";
      case GameResult.DRAW:
        return "½ : ½";
      default:
        return "";
    }
  };
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  return (
    <div className="w-full min-h-[300px] rounded-lg border text-center overflow-hidden">
      {/* Thead */}
      <div className="grid grid-cols-[10%,35%,10%,35%,10%] bg-blue-light dark:bg-blue-dark text-white">
        <div className="border-b p-2 flex flex-center">Datum</div>
        <div className="border-l border-b p-2 flex flex-center">
          <Xicon
            turn="X"
            height="16px"
            width="16px"
            stroke={theme === "dark" ? "#E31838" : "#AB2E58"}
          />
          <span className="ml-1">Hráč 1 (ELO)</span>
        </div>
        <div className="border-l border-b p-2 flex flex-center bg-red-light dark:bg-red-dark">
          Result
        </div>
        <div className="border-l border-b p-2 flex flex-center">
          <span className="mr-1">Hráč 2 (ELO)</span>
          <Oicon
            turn="O"
            height="16px"
            width="16px"
            stroke={theme === "dark" ? "#0070BB" : "#395A9A"}
          />
        </div>
        <div className="border-l border-b p-2 flex flex-center">± ELO</div>
      </div>

      {/* Tbody */}
      <div className="divide-y max-h-[295px] w-full h-full overflow-y-auto">
        {gameHistory.map((game) => (
          <Link
            key={`game-history-table-${game.game}`}
            href={`/multiplayer/${game.game}`}
            className="grid grid-cols-[10%,35%,10%,35%,10%] hover:bg-gray-100 dark:hover:bg-gray-800 ease-in-out transition-all"
          >
            <div className="flex flex-center">{formatDate(game.createdAt)}</div>
            <div className="border-l p-2 flex flex-center">
              {game.symbol === "X" ? (
                <>
                  <span className="truncate">{userData.username}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.elo})
                  </span>
                </>
              ) : (
                <>
                  <span className="truncate">{game.opponent.username}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.opponent.elo})
                  </span>
                </>
              )}
            </div>
            <div className="border-l flex flex-center">{getResult(game)}</div>
            <div className="border-l flex flex-center">
              {game.symbol === "X" ? (
                <>
                  <span className="truncate">{game.opponent.username}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.opponent.elo})
                  </span>
                </>
              ) : (
                <>
                  <span className="truncate">{userData.username}</span>
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.elo})
                  </span>
                </>
              )}
            </div>
            <div className="border-l flex flex-center">
              {game.elo_change > 0 ? "+" : ""}
              {game.elo_change}
            </div>
          </Link>
        ))}
        {gameHistory.length === 0 && (
          <div className="flex flex-center h-[295px]">
            Žádné hry nebyly nalezeny...
          </div>
        )}
      </div>
    </div>
  );
}
