import ConditionalLink from "@/components/core/ConditionalLink";
import { useGameManager } from "./GameManager";
import { Oicon, Xicon } from "@/components/game/Icons";
import { GameStatus, GameStatusPlayer } from "@/types/multiplayer/game";

export default function MobileUserInfo({
  className = "flex flex-center",
}: {
  className?: string;
}) {
  const { data, userSymbol, userTime, opponentTime, turn } = useGameManager();

  const formatPlayerData = (data: GameStatus | undefined) => {
    if (data === undefined) return;
    return {
      ...data.player,
      elo: data.elo,
    };
  };

  const getPlayerData = (data: GameStatus[] | undefined, symbol: "X" | "O") =>
    formatPlayerData(data?.find((status) => status.symbol === symbol));

  const playerX = getPlayerData(data?.game_status, "X");
  const playerO = getPlayerData(data?.game_status, "O");

  const timeX = userSymbol === "X" ? userTime : opponentTime;

  const timeO = userSymbol === "O" ? userTime : opponentTime;

  const formatTime = (time: number) => {
    if (time === 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const section = (
    player: (GameStatusPlayer & { elo: number }) | undefined,
    time: number | null,
    symbol: "X" | "O",
  ) => (
    <ConditionalLink
      href={`/profile/${player?.uuid}`}
      disabled={player === undefined} // player is anonymous
    >
      <div className="flex flex-center flex-col space-y-2">
        <div className="mt-4 w-full">
          {symbol === "X" ? (
            <div className="flex flex-col items-center flex-center font-bold text-6xl gap-5">
              <span className={turn === "X" ? "" : "opacity-0"}>Hraje</span>
              <Xicon turn={turn ? turn : "X"} width={128} height={128} />
            </div>
          ) : (
            <div className="flex flex-col items-center flex-center font-bold text-6xl gap-5">
              <span className={turn === "O" ? "" : "opacity-0"}>Hraje</span>
              <Oicon turn={turn ? turn : "O"} width={128} height={128} />
            </div>
          )}
        </div>
        {time !== undefined && time !== null && (
          <div className="flex flex-center">
            <div className="text-2xl font-bold">{formatTime(time)}</div>
          </div>
        )}
        <div className="flex flex-center flex-col">
          <div className="text-3xl font-bold">
            <span className="truncate max-w-[150px]">
              {player?.username || "Anonymous"}
            </span>
            {player?.elo && (
              <span className="text-gray-400 ml-1">({player?.elo})</span>
            )}
          </div>
        </div>
      </div>
    </ConditionalLink>
  );

  return (
    <div className={className}>
      {section(playerX, timeX, "X")}
      {section(playerO, timeO, "O")}
    </div>
  );
}
