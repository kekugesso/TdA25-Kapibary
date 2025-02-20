"use client";

import React, { useState } from "react";
import { RegisterCredentials, RegistrtionError } from "@/types/auth/register";

export default function RegisterForm({
  registerCredentials,
  setRegisterCredentialsAction,
  error,
  clearErrorAction,
  onSubmitAction,
}: {
  registerCredentials: RegisterCredentials;
  setRegisterCredentialsAction: React.Dispatch<
    React.SetStateAction<RegisterCredentials>
  >;
  error: RegistrtionError | null;
  clearErrorAction: () => void;
  onSubmitAction: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [passwordVerify, setPasswordVerify] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordVerify) return;
    onSubmitAction(e);
  };

  return (
    <form onSubmit={submit} className="flex flex-col w-full">
      <div>
        <label
          htmlFor="login"
          className={`text-md ${error?.username ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Uživatelské jméno
        </label>
        <input
          type="text"
          placeholder="Uživatelské jméno"
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${error?.username ? "border-red-light dark:border-red-dark" : ""}`}
          value={registerCredentials.username}
          onChange={(e) =>
            setRegisterCredentialsAction({
              ...registerCredentials,
              username: e.target.value,
            })
          }
          onFocus={clearErrorAction}
        />
        <div
          className={`text-red-light dark:text-red-dark text-md text-center font-bold ${error?.username ? "opacity-100" : "opacity-0"}`}
        >
          {error?.username || "Error message"}
        </div>
      </div>

      <div>
        <label
          htmlFor="login"
          className={`text-md ${error?.email ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Uživatelské jméno
        </label>
        <input
          type="email"
          placeholder="Email"
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${error?.email ? "border-red-light dark:border-red-dark" : ""}`}
          value={registerCredentials.email}
          onChange={(e) =>
            setRegisterCredentialsAction({
              ...registerCredentials,
              email: e.target.value,
            })
          }
          onFocus={clearErrorAction}
        />
        <div
          className={`text-red-light dark:text-red-dark text-md text-center font-bold ${error?.email ? "opacity-100" : "opacity-0"}`}
        >
          {error?.email || "Error message"}
        </div>
      </div>

      <div>
        <label
          htmlFor="login"
          className={`text-md ${error?.password ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Heslo
        </label>
        <input
          type="password"
          placeholder="Heslo"
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${error?.password ? "border-red-light dark:border-red-dark" : ""}`}
          value={registerCredentials.password}
          onChange={(e) => (
            setRegisterCredentialsAction({
              ...registerCredentials,
              password: e.target.value,
            }),
            setPasswordVerify(e.target.value === password)
          )}
          onFocus={clearErrorAction}
        />
        <div
          className={`text-red-light dark:text-red-dark text-md text-center font-bold ${error?.password ? "opacity-100" : "opacity-0"}`}
        >
          {error?.password || "Error message"}
        </div>
      </div>
      <div>
        <label
          htmlFor="login"
          className={`text-md ${error?.password ? "text-red-light dark:text-red-dark" : ""}`}
        >
          Kontrola hesla
        </label>
        <input
          type="password"
          placeholder="Kontrola hesla"
          className={`w-full p-3 rounded-lg shadow-sm dark:bg-black focus:outline-none border border-transparent focus:border-blue-light ${!passwordVerify || error?.password ? "border-red-light dark:border-red-dark" : ""}`}
          value={password}
          onChange={(e) => (
            setPassword(e.target.value),
            setPasswordVerify(e.target.value === registerCredentials.password)
          )}
          onFocus={clearErrorAction}
        />
        <div
          className={`text-red-light dark:text-red-dark text-md text-center font-bold ${!passwordVerify ? "opacity-100" : "opacity-0"}`}
        >
          {"Hesla se neshodují"}
        </div>
      </div>

      <button
        type="submit"
        className="bg-blue-light dark:bg-blue-dark text-white font-bold text-xl py-2 px-4 rounded-lg shadow-black-light shadow-sm w-full"
      >
        Registrovat se
      </button>
    </form>
  );
}
