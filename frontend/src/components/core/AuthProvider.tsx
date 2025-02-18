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
import { RegisterCredentials, RegisterResponse } from "@/types/auth/register";
import {
  LoginMutation,
  RegisterMutation,
  LogoutMutation,
} from "@/mutations/auth";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

export interface AuthContextType {
  user: User | null;
  isLogged: boolean;
  login: (credentials: LoginCredentials) => Promise<void | Error>;
  register: (credentials: RegisterCredentials) => Promise<void | Error>;
  check: () => Promise<boolean>;
  logout: () => Promise<void | Error>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const path = usePathname();

  const loginMutation = LoginMutation({
    onSuccessAction: (data: LoginResponse) => {
      setUser(data.user);
      setCookie("authToken", data.token);
      router.push(`/profile/${data.user.uuid}`);
    },
    onErrorAction: (error: Error) => {
      console.error("Login error:", error);
      throw error;
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void | Error> => {
      try {
        await loginMutation.mutateAsync(credentials);
      } catch (error) {
        console.error("Login error:", error);
        return error as Error;
      }
    },
    [loginMutation],
  );

  const registerMutation = RegisterMutation({
    onSuccessAction: async (data: RegisterResponse) => {
      setUser(data.user);
      setCookie("authToken", data.token);
      router.push(`/profile/${data.user.uuid}`);
    },
    onErrorAction: (error: Error) => {
      console.error("Registration error:", error);
      throw error;
    },
  });

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<void | Error> => {
    try {
      await registerMutation.mutateAsync(credentials);
    } catch (error) {
      console.error("Registration error:", error);
      return error as Error;
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
          Authorization: `Token ${await getCookie("authToken")}`,
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
    onSuccessAction: () => {
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
      const token: string | undefined = await getCookie("authToken");
      if (!token) {
        console.error("No token found");
        throw Error("You are not logged in");
      }
      await logoutMutation.mutateAsync(token);
    } catch (error) {
      console.error("Logout error:", error);
      return error as Error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      if (await getCookie("authToken")) {
        const initializeUser = async () => {
          if (await check()) {
            const user = checkQuery.data;
            if (user) setUser(user);
            setLoading(false);
          } else {
            deleteCookie("authToken");
            setUser(null);
            router.push("/login");
          }
        };

        if (loading) initializeUser();
      } else setLoading(false);
    };

    const timer = setTimeout(async () => {
      setLoading(true);
      initializeAuth();
    }, 60000);

    initializeAuth();
    return () => clearTimeout(timer);
  }, [check, checkQuery, user, checkQuery.data, router, loading, path]);

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
