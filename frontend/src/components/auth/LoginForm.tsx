"use client";

import React from "react";
import { LoginCredentials } from "@/types/auth/login";

export default function LoginForm({
  loginCredentials,
  setLoginCredentialsAction,
  error,
  clearErrorAction,
  onSubmitAction,
}: {
  loginCredentials: LoginCredentials;
  setLoginCredentialsAction: React.Dispatch<
    React.SetStateAction<LoginCredentials>
  >;
  error: string | null;
  clearErrorAction: () => void;
  onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmitAction} className="flex flex-col space-y-4 w-full">
      <div>
        <label
          htmlFor="login"
          className={`text-md ${error ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Uživatelské jméno nebo Email
        </label>
        <input
          type="text"
          placeholder="Uživatelské jméno nebo Email..."
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${error ? "border-red-light dark:border-red-dark" : ""}`}
          value={loginCredentials.login}
          onChange={(e) =>
            setLoginCredentialsAction({
              ...loginCredentials,
              login: e.target.value,
            })
          }
          onFocus={clearErrorAction}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className={`text-md ${error ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Heslo
        </label>
        <input
          type="password"
          placeholder="Heslo..."
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${error ? "border border-red-light dark:border-red-dark" : ""}`}
          value={loginCredentials.password}
          onChange={(e) =>
            setLoginCredentialsAction({
              ...loginCredentials,
              password: e.target.value,
            })
          }
          onFocus={clearErrorAction}
        />
      </div>
      <div>
        <div
          className={`text-red-light dark:text-red-dark text-md text-center font-bold ${error ? "opacity-100" : "opacity-0"}`}
        >
          {error || "Error message"}
        </div>
        <button
          type="submit"
          className="bg-blue-light dark:bg-blue-dark text-white font-bold text-xl py-2 px-4 rounded-lg shadow-black-light shadow-sm w-full"
        >
          Přihlásit se
        </button>
      </div>
    </form>
  );
}
