import { User } from "@/types/auth/user";

type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

export type { LoginCredentials, LoginResponse };
