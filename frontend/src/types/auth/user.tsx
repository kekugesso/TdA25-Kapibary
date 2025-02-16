type User = {
  uuid: string;
  elo: number;
  createdAt: string;
  username: string;

  email?: string;
  wins?: number;
  losses?: number;
  draws?: number;
};

export type { User };
