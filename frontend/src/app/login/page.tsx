"use client";

import CoverElement from "@/components/auth/CoverElement";
import LoginForm from "@/components/auth/LoginForm";
import MobileSwitch from "@/components/auth/MobileSwitch";
import RegisterForm from "@/components/auth/RegistrationForm";
import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import { LoginCredentials } from "@/types/auth/login";
import { RegisterCredentials, RegistrtionError } from "@/types/auth/register";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginRegister() {
  const { login, register, loading, isLogged, user } = useAuth();
  const router = useRouter();
  const { displayError } = useErrorModal();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<RegistrtionError | null>(
    null,
  );

  // Redirect to profile if user is logged in
  useEffect(() => {
    if (loading === false && isLogged) router.push(`/profile/${user?.uuid}`);
  }, [loading, isLogged, router, user]);

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
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const error = await login(loginCredentials);
    if (error)
      if (error.name === "InvalidCredentials")
        setLoginError(error.message || "Invalid credentials");
      else
        displayError(error, {
          defaultMessage: "An error ocured while logging in",
        });
  };

  const registerValid = (
    registerCredentials: RegisterCredentials,
  ): RegistrtionError | void => {
    if (!registerCredentials.username)
      return { username: ["Uživatelské jméno je povinné"] };
    if (!registerCredentials.password)
      return { password: ["Heslo je povinné"] };

    // password validation
    if (registerCredentials.password.length < 8)
      return { password: ["Heslo musí mít alespoň 8 znaků"] };
    if (!registerCredentials.password.match(/[0-9]/))
      return { password: ["Heslo musí obsahovat alespoň jedno číslo"] };
    if (!registerCredentials.password.match(/[a-z]/))
      return { password: ["Heslo musí obsahovat alespoň jedno malé písmeno"] };
    if (!registerCredentials.password.match(/[A-Z]/))
      return { password: ["Heslo musí obsahovat alespoň jedno velké písmeno"] };
    if (!registerCredentials.password.match(/[^a-zA-Z0-9]/))
      return {
        password: ["Heslo musí obsahovat alespoň jeden speciální znak"],
      };

    return;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let error: Error | RegistrtionError | void =
      registerValid(registerCredentials);
    if (!error) error = await register(registerCredentials);
    if (error)
      if (error instanceof Error)
        displayError(error, {
          defaultMessage: "An error ocured while registering",
        });
      else setRegisterError(error as RegistrtionError);
  };

  return (
    <>
      {loading || isLogged ? (
        <Loading />
      ) : (
        <article className="flex flex-center md:grid grid-cols-2">
          <div
            className={`absolute md:static transition-all duration-700 p-[5%] flex flex-col flex-center ${!isRegisterMode ? "z-10 opacity-100" : "opacity-0"}`}
          >
            <MobileSwitch
              mode={isRegisterMode}
              setModeAction={setIsRegisterMode}
            />
            <div className="text-center text-white text-3xl font-bold -mt-5 mb-5">
              Přihlášení
            </div>
            <LoginForm
              loginCredentials={loginCredentials}
              setLoginCredentialsAction={setLoginCredentials}
              error={loginError}
              clearErrorAction={() => setLoginError(null)}
              onSubmitAction={handleLogin}
            />
          </div>
          <div
            className={`absolute md:static transition-all duration-700 p-[5%] flex flex-col flex-center ${isRegisterMode ? "z-10 opacity-100" : "opacity-0"}`}
          >
            <MobileSwitch
              mode={isRegisterMode}
              setModeAction={setIsRegisterMode}
            />
            <div className="text-center text-white text-3xl font-bold -mt-5 mb-5">
              Registrace
            </div>
            <RegisterForm
              registerCredentials={registerCredentials}
              setRegisterCredentialsAction={setRegisterCredentials}
              error={registerError}
              clearErrorAction={() => setRegisterError(null)}
              onSubmitAction={handleRegister}
            />
          </div>
          <div
            className={`hidden absolute md:flex flex-center left-1/2 w-1/2 h-page transition-transform duration-700 ${isRegisterMode ? "-translate-x-[100%]" : "translate-x-100"}`}
          >
            <CoverElement
              hideCover={isRegisterMode}
              title="Přihlaste se a odemkněte plný herní zážitek!"
              subtitle="S účtem můžete sledovat své výhry, pokračovat v rozehraných hrách a soutěžit s přáteli. Připojte se a užijte si piškvorky naplno!"
              linkTitle="Ještě nemáte účet?"
              linkText="Registrujte se"
              linkAction={() => setIsRegisterMode(true)}
            />
            <CoverElement
              hideCover={!isRegisterMode}
              title="Registrujte se a odemkněte plný herní zážitek!"
              subtitle="S účtem můžete sledovat své výhry, pokračovat v rozehraných hrách a soutěžit s přáteli. Připojte se a užijte si piškvorky naplno!"
              linkTitle="Již máte účet?"
              linkText="Přihlaste se"
              linkAction={() => setIsRegisterMode(false)}
            />
          </div>
        </article>
      )}
    </>
  );
}
