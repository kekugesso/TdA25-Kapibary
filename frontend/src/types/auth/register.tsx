import { LoginResponse } from "./login";

type RegisterCredentials = {
  email?: string;
  username: string;
  password: string;
  elo: number;
};

type RegisterResponse = LoginResponse;

export type { RegisterCredentials, RegisterResponse };
