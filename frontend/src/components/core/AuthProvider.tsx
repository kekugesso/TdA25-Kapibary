"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { User } from "@/types/auth/user";
import { LoginCredentials, LoginResponse } from "@/types/auth/login";
import {
  RegisterCredentials,
  RegisterResponse,
  RegistrtionError,
} from "@/types/auth/register";
import {
  LoginMutation,
  RegisterMutation,
  LogoutMutation,
} from "@/mutations/auth";
import { getCookie, setCookie, deleteCookie } from "cookies-next/client";

export interface AuthContextType {
  user: User | null;
  isLogged: boolean;
  login: (credentials: LoginCredentials) => Promise<void | Error>;
  register: (
    credentials: RegisterCredentials,
  ) => Promise<void | RegistrtionError | Error>;
  check: () => Promise<boolean>;
  logout: () => Promise<void | Error>;
  loading: boolean;
  getToken: () => string | undefined;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const path = usePathname();

  const loginSucess = async (data: LoginResponse | RegisterResponse) => {
    deleteCookie("anonymous");
    setUser(data.user);
    setCookie("authToken", data.token, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });
    router.prefetch(
      data.user.is_superuser ? "/admin" : `/profile/${data.user.uuid}`,
    );
  };

  const loginMutation = LoginMutation({
    onSuccessAction: loginSucess,
    onErrorAction: (error: Error) => {
      throw error;
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void | Error> => {
      try {
        await loginMutation.mutateAsync(credentials);
      } catch (error) {
        const error_typed = error as Error;
        if (error_typed.name === "InvalidCredentials") return error_typed;

        console.error("Login error:", error);
        return error_typed;
      }
    },
    [loginMutation],
  );

  const registerMutation = RegisterMutation({
    onSuccessAction: loginSucess,
    onErrorAction: (error: Error | RegistrtionError) => {
      throw error;
    },
  });

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<void | RegistrtionError | Error> => {
    try {
      await registerMutation.mutateAsync(credentials);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Registration error:", error);
        return error;
      }
      return error as RegistrtionError;
    }
  };

  const checkQuery = useQuery({
    enabled: false,
    retry: false,
    queryKey: ["check"],
    queryFn: async () =>
      await fetch("/api/check", {
        method: "GET",
        headers: {
          Authorization: `Token ${getToken()}`,
        },
      }).then(async (res) => {
        if (res.status == 200) return (await res.json()) as User;
        deleteCookie("authToken");
        setUser(null);
        router.push("/login");
        throw new Error(await res.json());
      }),
  });

  const check = useCallback(async (): Promise<boolean> => {
    const { data } = await checkQuery.refetch();
    if (data) setUser(data);
    return !!data;
  }, [checkQuery]);

  const logoutMutation = LogoutMutation({
    onSuccessAction: async () => {
      setUser(null);
      deleteCookie("authToken");
      router.push("/login");
    },
    onErrorAction: (error: Error) => {
      throw error;
    },
  });

  const logout = async (): Promise<void | Error> => {
    try {
      const token: string | undefined = getToken();
      if (!token) throw Error("You are not logged in");
      await logoutMutation.mutateAsync(token);
    } catch (error) {
      checkQuery.refetch();
      return error as Error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (getCookie("authToken")) {
        const initializeUser = async () => {
          if (await check()) {
            const user = checkQuery.data;
            if (user) setUser(user);
            setLoading(false);
          }
        };

        if (loading) initializeUser();
      } else setLoading(false);
    };

    if (getCookie("anonymous")) setLoading(false);
    else initializeAuth();
  }, [check, checkQuery, user, checkQuery.data, router, loading, path]);

  useEffect(() => {
    if (loading) return;
    if (checkQuery.isError) return;
    if (!getCookie("authToken")) return;
    if (getCookie("anonymous")) return;
    checkQuery.refetch();
  }, [path, loading, checkQuery]);

  const getToken = () => {
    if (getCookie("anonymous")) {
      deleteCookie("anonymous");
      deleteCookie("authToken");
    }
    return getCookie("authToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        check,
        loading:
          loading ||
          checkQuery.isLoading ||
          loginMutation.isPending ||
          registerMutation.isPending ||
          logoutMutation.isPending,
        isLogged: !!user,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
