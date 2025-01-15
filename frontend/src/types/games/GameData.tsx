import { BoardData } from "@/types/board/BoardData";
import { GameStateType } from "@/types/games/GameState";

type GameData = BoardData & {
  uuid: string;
  updatedAt: Date;
  createdAt: Date;
  gameState: GameStateType;
};

export type { GameData };
