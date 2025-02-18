import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { User } from "@/types/auth/user";
import { LoginCredentials, LoginResponse } from "@/types/auth/login";
import { RegisterCredentials, RegisterResponse } from "@/types/auth/register";
import {
  useLoginMutation,
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

  const loginMutation = useLoginMutation({
    onSuccessAction: (data: LoginResponse) => {
      setUser(data.user);
      setCookie("authToken", data.token);
      setCookie("userUUID", data.user.uuid);
      router.push(`/profile/${data.user.uuid}`);
    },
    onErrorAction: (error: Error) => {
      console.error("Login error:", error);
      throw error;
    },
  });

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void | Error> => {
      setLoading(true);
      try {
        await loginMutation.mutateAsync(credentials);
      } catch (error) {
        console.error("Login error:", error);
        return error as Error;
      }
      setLoading(false);
    },
    [loginMutation],
  );

  const registerMutation = RegisterMutation({
    onSuccessAction: async (data: RegisterResponse) => {
      setUser(data.user);
      setCookie("authToken", data.token);
      setCookie("userUUID", data.user.uuid);
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
    queryKey: ["check"],
    queryFn: async () =>
      await fetch("/api/check", {
        method: "GET",
        headers: {
          Authorization: `Token ${await getCookie("authToken")}`,
        },
      }).then(async (res) => {
        if (res.ok) {
          setUser(await res.json());
          return true;
        }
        console.error("Error during token check:", await res.json());
        deleteCookie("authToken");
        setUser(null);
        router.push("/login");
        return false;
      }),
  });

  const check = useCallback(async (): Promise<boolean> => {
    try {
      await checkQuery.refetch();
      return checkQuery.isSuccess;
    } catch (error) {
      console.error("Error during token check:", error);
      return false;
    }
  }, [checkQuery]);

  const logoutMutation = LogoutMutation({
    onSuccessAction: () => {
      setUser(null);
      deleteCookie("authToken");
      queryClient.clear();
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
          queryClient.isMutating() > 0 ||
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
