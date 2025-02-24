import { GameHistory, GameResult, User } from "@/types/auth/user";
import { Oicon, Xicon } from "../game/Icons";
import Link from "next/link";

export default function GameHistoryTable({
  userData,
  gameHistory,
}: {
  userData: User;
  gameHistory: GameHistory[];
}) {
  const getResult = (result: GameResult) => {
    switch (result) {
      case GameResult.WIN:
        return "1 : 0";
      case GameResult.LOSE:
        return "0 : 1";
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
      <div className="grid grid-cols-[10%,35%,10%,35%,10%] bg-black-light dark:bg-blue-dark">
        <div className="border-b p-2 flex flex-center">Datum</div>
        <div className="border-l border-b p-2 flex flex-center">
          <Xicon turn="X" height="16px" width="16px" />
          <span className="ml-1">Hráč 1 (ELO)</span>
        </div>
        <div className="border-l border-b p-2 flex flex-center bg-red-light dark:bg-red-dark">
          Result
        </div>
        <div className="border-l border-b p-2 flex flex-center">
          <span className="mr-1">Hráč 2 (ELO)</span>
          <Oicon turn="O" height="16px" width="16px" />
        </div>
        <div className="border-l border-b p-2 flex flex-center">± ELO</div>
      </div>

      {/* Tbody */}
      <div className="max-h-[295px] w-full h-full overflow-y-auto">
        {gameHistory.map((game, index, array) => (
          <Link
            href={`/games/${game.uuid}`}
            key={game.uuid}
            className="grid grid-cols-[10%,35%,10%,35%,10%] hover:bg-gray-100 dark:hover:bg-gray-800 ease-in-out transition-all border-b"
            {...(array.length >= 8 &&
              index === array.length - 1 && {
                style: { borderBottom: "none" },
              })}
          >
            <div className="flex flex-center">{formatDate(game.createdAt)}</div>
            <div className="border-l p-2 flex flex-center">
              {game.symbol === "X" ? (
                <>
                  {userData.username}
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.elo})
                  </span>
                </>
              ) : (
                <>
                  {game.opponent.username}
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.opponent.elo})
                  </span>
                </>
              )}
            </div>
            <div className="border-l flex flex-center">
              {getResult(game.result)}
            </div>
            <div className="border-l flex flex-center">
              {game.symbol === "X" ? (
                <>
                  {game.opponent.username}
                  <span className="ml-1 text-gray-600 dark:text-gray-300">
                    ({game.opponent.elo})
                  </span>
                </>
              ) : (
                <>
                  {userData.username}
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
          <div className="flex flex-center h-full">No games played yet...</div>
        )}
      </div>
    </div>
  );
}
