import { User } from "@/types/auth/user";

type RegisterCredentials = {
  email?: string;
  username: string;
  password: string;
  elo: number;
};

type RegisterResponse = User;

export type { RegisterCredentials, RegisterResponse };
