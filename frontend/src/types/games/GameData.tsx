import { BoardData } from "@/types/board/BoardData";
import { GameStateType } from "@/types/games/GameState";

type GameData = BoardData & {
  uuid: string;
  updatedAt: string;
  createdAt: string;
  gameState: GameStateType;
};

export type { GameData };
