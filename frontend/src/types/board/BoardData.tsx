import { difficulty } from "@/types/search/difficulty";
import { BoardType } from "@/types/board/BoardType";

type BoardData = {
  name: string;
  difficulty: difficulty;
  board: BoardType;
};

export type { BoardData };
