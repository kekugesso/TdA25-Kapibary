import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { User } from "@/types/auth/user";
import { LoginCredentials, LoginResponse } from "@/types/auth/login";
import { RegisterCredentials } from "@/types/auth/register";
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
  const queryClient = useQueryClient();

  const login = async (
    credentials: LoginCredentials,
  ): Promise<void | Error> => {
    try {
      await LoginMutation({
        onSuccess: (data: LoginResponse) => {
          setUser(data.user);
          setCookie("authToken", data.token);
          setCookie("userUUID", data.user.uuid);
          router.back();
        },
        onError: (error: Error) => {
          console.error("Login error:", error);
          return error;
        },
      }).mutateAsync(credentials);
    } catch (error) {
      console.error("Login error:", error);
      return error as Error;
    }
  };

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<void | Error> => {
    try {
      setLoading(true);
      await RegisterMutation({
        onSuccess: async () => {
          await LoginMutation({
            onSuccess: (data: LoginResponse) => {
              setUser(data.user);
              setCookie("authToken", data.token);
              setCookie("userUUID", data.user.uuid);
              setLoading(false);
              router.back();
            },
            onError: (error: Error) => {
              console.error("Login error:", error);
              return error;
            },
          }).mutateAsync({
            username: credentials.username,
            password: credentials.password,
          });
        },
        onError: (error: Error) => {
          console.error("Registration error:", error);
          return error;
        },
      }).mutateAsync(credentials);
    } catch (error) {
      console.error("Registration error:", error);
      return error as Error;
    }
  };

  const check = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch("/api/check", {
        method: "GET",
        headers: {
          Authorization: `Token ${getCookie("authToken")}`,
        },
      });

      setLoading(false);
      if (!res.ok) return false;
      return true;
    } catch (error) {
      console.error("Error during token check:", error);
      return false;
    }
  }, []);

  const logout = async (): Promise<void | Error> => {
    try {
      setLoading(true);
      const token: string | undefined = await getCookie("authToken");
      if (!token) {
        console.error("No token found");
        return Error("You are not logged in");
      }
      await LogoutMutation({
        onSuccess: () => {
          setUser(null);
          deleteCookie("authToken");
          queryClient.clear();
          setLoading(false);
          router.push("/login");
        },
        onError: (error: Error) => {
          console.error("Logout error:", error);
          return error;
        },
      }).mutateAsync(token);
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
            const userUUID = getCookie("userUUID") as string | undefined;

            if (!userUUID) {
              deleteCookie("authToken");
              setUser(null);
              router.push("/login");
              return;
            }

            try {
              const user = await queryClient.ensureQueryData({
                queryKey: ["user", userUUID],
                queryFn: async (): Promise<User> => {
                  const res = await fetch(`/api/users/${userUUID}`);
                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(
                      errorData.message || "Failed to fetch user data",
                    );
                  }
                  return res.json();
                },
              });

              setUser(user);
            } catch (error) {
              console.error("Error fetching user:", error);
              deleteCookie("authToken");
              setUser(null);
              router.push("/login");
            }
          } else {
            deleteCookie("authToken");
            setUser(null);
            router.push("/login");
          }
        };
        initializeUser();
      } else setLoading(false);
    };
    initializeAuth();
  }, [check, router, queryClient]);

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
          queryClient.isFetching() > 0 ||
          queryClient.isMutating() > 0,
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
