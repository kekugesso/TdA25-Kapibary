"use client";

import { GameHistory } from "@/types/auth/user";
import GraphPopover from "./GameHistoryGraphPopover";
import { useTheme } from "next-themes";

export default function GameHistoryGraph({
  gameHistory,
}: {
  gameHistory: GameHistory[];
}) {
  const { theme } = useTheme();
  if (!gameHistory) return <></>;
  const sortedHistory = [...gameHistory].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const svgWidth = 1000;
  const svgHeight = 300;
  const xStart = 10;
  const xEnd = 980;
  const yBottom = 290;
  const yTop = 10;

  const elos = sortedHistory.map((g) => g.elo);
  const minElo = Math.min(...elos);
  const maxElo = Math.max(...elos);

  const xScale = (index: number): number => {
    if (sortedHistory.length === 1) return (xStart + xEnd) / 2;
    return xStart + (index / (sortedHistory.length - 1)) * (xEnd - xStart);
  };

  const yScale = (elo: number): number => {
    if (maxElo === minElo) return (yBottom + yTop) / 2;
    return yBottom - ((elo - minElo) / (maxElo - minElo)) * (yBottom - yTop);
  };

  let pathData = "";
  sortedHistory.forEach((game, index) => {
    const x = xScale(index);
    const y = yScale(game.elo);
    if (index === 0) pathData += `M ${x} ${y}`;
    else pathData += ` L ${x} ${y}`;
  });

  const strokeColor = theme === "dark" ? "white" : "black";

  return (
    <svg
      key="graph"
      width="100%"
      height="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M980 296L990 290L980 284"
        stroke={strokeColor}
        strokeWidth="2"
        fill="none"
      />
      <line
        x1="10"
        y1="290"
        x2="990"
        y2="290"
        stroke={strokeColor}
        strokeWidth="2"
      />

      <path d="M4 15L10 2L16 15" strokeWidth="2" stroke={strokeColor} />
      <line
        x1="10"
        y1="2"
        x2="10"
        y2="290"
        stroke={strokeColor}
        strokeWidth="2"
      />

      <path d={pathData} strokeWidth="2" stroke={strokeColor} />
      {sortedHistory.map((game, index) => {
        const cx = xScale(index);
        const cy = yScale(game.elo);

        return (
          <GraphPopover key={`${cx}-${cy}`} game={game}>
            {(showAction, hideAction) => (
              <circle
                cx={cx}
                cy={cy}
                r={6}
                fill="#395A9A"
                onMouseOver={showAction}
                onMouseLeave={hideAction}
              />
            )}
          </GraphPopover>
        );
      })}
    </svg>
  );
}
