"use client";

import { useAuth } from "@/components/core/AuthProvider";
import Loading from "@/components/core/Loading";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/core/Modal";
import { LoginCredentials } from "@/types/auth/login";
import { RegisterCredentials } from "@/types/auth/register";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const { login, register, loading, isLogged } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<Error | null>(null);

  const handleClose = () => {
    setError(null);
    router.back();
  };

  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({
    username: "",
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
    if (error) setError(error);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = await register(registerCredentials);
    if (error) setError(error);
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
              placeholder="Username"
              value={loginCredentials.username}
              onChange={(e) =>
                setLoginCredentials({
                  ...loginCredentials,
                  username: e.target.value,
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
      {error && (
        <Modal open={true} onClose={handleClose}>
          <ModalHeader>Error</ModalHeader>
          <ModalBody>
            <p className="text-center text-balance font-medium">
              {error.message || "An error ocured while logging out"}
            </p>
          </ModalBody>
          <ModalFooter>
            <button
              onClick={handleClose}
              className="bg-blue-light dark:bg-blue-dark text-white dark:text-black font-semibold rounded-lg py-2 px-6"
            >
              Go back
            </button>
          </ModalFooter>
        </Modal>
      )}
    </>
  );
}
