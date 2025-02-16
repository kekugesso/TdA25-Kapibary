import { difficulty } from "@/types/search/difficulty";
import { BoardType } from "@/types/board/BoardType";

type BoardData = {
  name: string | null;
  difficulty: difficulty | null;
  board: BoardType;
};

export type { BoardData };
