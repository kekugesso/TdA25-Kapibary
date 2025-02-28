import ConditionalLink from "@/components/core/ConditionalLink";
import { useGameManager } from "./GameManager";
import Image from "next/image";
import { Oicon, Xicon } from "@/components/game/Icons";

export default function UserInfo({
  symbol,
  className = "flex flex-center flex-col",
}: {
  symbol: "X" | "O";
  className?: string;
}) {
  const { data, userSymbol, userTime, opponentTime, turn } = useGameManager();

  const player =
    symbol === "X"
      ? data?.game_status.find((status) => status.symbol === "X")
      : data?.game_status.find((status) => status.symbol === "O");

  const time = symbol === userSymbol ? userTime : opponentTime;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={className}>
      <ConditionalLink
        href={`/profile/${player?.player.uuid}`}
        disabled={player === undefined} // player is anonymous
      >
        {time && (
          <div className="flex flex-center">
            <div className="text-2xl font-bold">{formatTime(time)}</div>
          </div>
        )}
        <div className="flex flex-center md:flex-col space-x-5 md:space-x-0">
          <div className="flex flex-center flex-col">
            <Image
              src={player?.player.avatar || "/img/avatar.svg"}
              alt="Profile Picture"
              width={150}
              height={150}
              className="w-[150px] h-[150px] rounded-lg bg-gray-100 dark:bg-white-dark object-cover"
            />
            <div className="text-3xl font-bold max-w-[150px] truncate">
              {player?.player.username || "Anonymous"}
            </div>
          </div>
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
        </div>
      </ConditionalLink>
    </div>
  );
}
