type User = {
  uuid: string;
  avatar: string;
  elo: number;
  createdAt: string;
  username: string;
  email: string;

  wins: number;
  losses: number;
  draws: number;
};

type SmallUser = {
  username: string;
  elo: number;
};

enum GameResult {
  UNKNOWN = "unknown",
  WIN = "win",
  LOSE = "lose",
  DRAW = "draw",
}

type GameHistory = {
  uuid: string;
  createdAt: string;
  elo: number;
  elo_change: number;
  symbol: "X" | "O";
  result: GameResult;
  opponent: SmallUser;
};

type UserSettings = {
  username?: string;
  email?: string;
  password?: string;
  avatar?: string;
};

type UserSettingsError = {
  username?: string[];
  email?: string[];
  password?: string[];
  avatar?: string[];
};

export type { User, SmallUser, GameHistory, UserSettings, UserSettingsError };
export { GameResult };
