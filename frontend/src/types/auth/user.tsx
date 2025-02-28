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

  is_superuser: boolean;
  is_banned: boolean;
  position?: number;
};

type SmallUser = {
  username: string;
  elo: number;
};

type UserSettings = {
  username: string;
  password: string;
  email?: string;
  avatar?: string;
  new_password?: string;
};

type UserSettingsError = {
  username?: string[];
  email?: string[];
  password?: string[];
  avatar?: string[];
  new_password?: string[];
};

export type { User, SmallUser, UserSettings, UserSettingsError };
