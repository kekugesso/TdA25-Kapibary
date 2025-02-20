import { LoginResponse } from "./login";

type RegisterCredentials = {
  email?: string;
  username: string;
  password: string;
  elo: number;
};

type RegisterResponse = LoginResponse;

type RegistrtionError = {
  username?: string[];
  email?: string[];
  password?: string[];
};

export type { RegisterCredentials, RegisterResponse, RegistrtionError };
