"use client";
import { AdminManager, useAdminManager } from "@/components/admin/AdminManager";
import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import PagedItems from "@/components/core/pagination/PagedItems";
import PageSelector from "@/components/core/pagination/PageSelector";
import Pagination from "@/components/core/pagination/Pagination";
import { User } from "@/types/auth/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Admin() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { displayError } = useErrorModal();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (loading) return;
    if (!user || (user && !user.is_superuser)) router.push("/login");
  }, [user, router, loading]);

  const fetchItems = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const res = await fetch(`/api/users?page=${page}&page_size=${pageSize}`);
    if (!res.ok) {
      throw new Error("Failed to fetch leaderboards");
    }
    return await res.json();
  };

  const banUserMutation = useMutation({
    mutationFn: async (uuid: string) => {
      const res = await fetch(`/api/users/${uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getCookie("authToken")}`,
        },
        body: JSON.stringify({ is_banned: true }),
      });
      if (!res.ok) {
        throw new Error("Failed to ban user");
      }
      return await res.json();
    },
    onError: (error) => {
      displayError(error as Error, {
        defaultMessage: "Failed to ban user",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const changeEloMutation = useMutation({
    mutationFn: async ({ uuid, elo }: { uuid: string; elo: number }) => {
      const res = await fetch(`/api/users/${uuid}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getCookie("authToken")}`,
        },
        body: JSON.stringify({ new_elo: elo }),
      });
      if (!res.ok) {
        throw new Error("Failed to change elo");
      }
      return await res.json();
    },
    onError: (error) => {
      displayError(error as Error, {
        defaultMessage: "Failed to change elo",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return loading || !user?.is_superuser ? (
    <Loading />
  ) : (
    <AdminManager
      banAction={(uuid: string) => banUserMutation.mutate(uuid)}
      changeEloAction={(uuid: string, elo: number) =>
        changeEloMutation.mutate({ uuid, elo })
      }
    >
      <Pagination<User> queryKey={["users"]} fetcherAction={fetchItems}>
        <article className="flex flex-col">
          <PagedItems<User>>
            {(items) => (
              <ul className="p-[5%] space-y-2">
                {items.map((item) => (
                  <TableItem key={item.uuid} {...item} />
                ))}
              </ul>
            )}
          </PagedItems>
          <div className="flex-1" />
          <PageSelector />
        </article>
      </Pagination>
    </AdminManager>
  );
}

function TableItem(item: User) {
  const { ban, changeElo } = useAdminManager();

  return (
    <li
      key={item.uuid}
      className="p-2 grid grid-cols-[7.5%,7.5%,30%,10%,37.5%,7.5%] text-center items-center font-bold text-3xl bg-black rounded-lg"
    >
      <span className="flex flex-center">
        <Image
          src={item.avatar || "/img/avatar.svg"}
          alt={item.username}
          width={64}
          height={64}
          className="rounded-lg bg-white"
        />
      </span>
      <span className="text-start">
        {item.username}({item.elo})
      </span>
      <button
        onClick={() => ban(item.username, item.uuid)}
        className="bg-red text-white rounded-lg p-2"
      >
        Ban
      </button>
      <button
        onClick={() => changeElo(item.username, item.uuid, item.elo)}
        className="bg-green text-white rounded-lg p-2"
      >
        Change Elo
      </button>
    </li>
  );
}
