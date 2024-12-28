import { difficulty } from "@/components/games/search/types";

type BoardType = string[][];

type BoardData = {
  name: string;
  difficulty: difficulty;
  board: BoardType;
};

export type { BoardType, BoardData };
