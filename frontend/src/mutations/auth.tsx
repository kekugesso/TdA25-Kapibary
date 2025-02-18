"use client";

import { useMutation } from "@tanstack/react-query";
import { LoginCredentials, LoginResponse } from "@/types/auth/login";
import { RegisterCredentials, RegisterResponse } from "@/types/auth/register";

export const useLoginMutation = ({
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

      if (!res.ok) {
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
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
