"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { LoginCredentials, LoginResponse } from "@/types/auth/login";
import {
  RegisterCredentials,
  RegisterResponse,
  RegistrtionError,
} from "@/types/auth/register";
import { User } from "@/types/auth/user";

export const LoginMutation = ({
  onSuccessAction,
  onErrorAction,
}: {
  onSuccessAction: (data: LoginResponse) => void;
  onErrorAction: (error: Error) => void;
}) =>
  useMutation({
    onSuccess: onSuccessAction,
    onError: onErrorAction,
    mutationFn: async (
      credentials: LoginCredentials,
    ): Promise<LoginResponse> => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (res.status === 401) {
        const error = new Error("Špatné přihlašovací údaje");
        error.name = "InvalidCredentials";
        throw error;
      }

      if (res.status != 200) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      return res.json();
    },
  });

export const RegisterMutation = ({
  onSuccessAction,
  onErrorAction,
}: {
  onSuccessAction: (data: RegisterResponse) => void;
  onErrorAction: (error: Error) => void;
}) =>
  useMutation({
    onSuccess: onSuccessAction,
    onError: onErrorAction,
    mutationFn: async (
      credentials: RegisterCredentials,
    ): Promise<RegisterResponse> => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (res.status === 400) throw (await res.json()) as RegistrtionError;

      if (res.status != 200) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Register failed");
      }

      return res.json();
    },
  });

export const LogoutMutation = ({
  onSuccessAction,
  onErrorAction,
}: {
  onSuccessAction: () => void;
  onErrorAction: (error: Error) => void;
}) =>
  useMutation({
    onSuccess: onSuccessAction,
    onError: onErrorAction,
    mutationFn: async (token: string): Promise<void> => {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Logout failed");
      }
    },
  });

export const UserQuery = (uuid: string) =>
  useQuery({
    queryKey: ["user", uuid],
    queryFn: async () => {
      const res = await fetch(`/api/users/${uuid}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch user data");
      }
      return (await res.json()) as User;
    },
  });
