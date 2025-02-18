"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import { LoginCredentials } from "@/types/auth/login";
import { RegisterCredentials } from "@/types/auth/register";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const { login, register, loading, isLogged } = useAuth();
  const router = useRouter();
  const { displayError } = useErrorModal();

  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    login: "",
    password: "",
  });
  const [registerCredentials, setRegisterCredentials] =
    useState<RegisterCredentials>({
      username: "",
      password: "",
      email: "",
      elo: 400,
    });

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = await login(loginCredentials);
    if (error)
      displayError(error, {
        defaultMessage: "An error ocured while logging in",
      });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = await register(registerCredentials);
    if (error)
      displayError(error, {
        defaultMessage: "An error ocured while registering",
      });
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username or Email"
              value={loginCredentials.login}
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  login: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={loginCredentials.password}
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  password: e.target.value,
                })
              }
            />
            <button type="submit">Login</button>
          </form>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              placeholder="Username"
              value={registerCredentials.username}
              onChange={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  username: e.target.value,
                })
              }
            />
            <input
              type="email"
              placeholder="Email"
              value={registerCredentials.email}
              onChange={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  email: e.target.value,
                })
              }
            />
            <input
              type="password"
              placeholder="Password"
              value={registerCredentials.password}
              onChange={(e) =>
                setRegisterCredentials({
                  ...registerCredentials,
                  password: e.target.value,
                })
              }
            />
            <button type="submit">Register</button>
          </form>
          {isLogged && (
            <>
              <div>You are logged in!</div>
              <button onClick={() => router.push("/logout")}>Logout</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
