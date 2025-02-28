"use client";
import { AdminManager, useAdminManager } from "@/components/admin/AdminManager";
import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import PagedItems from "@/components/core/pagination/PagedItems";
import { PagedSearchBar } from "@/components/core/pagination/PagedSearchBar";
import PageSelector from "@/components/core/pagination/PageSelector";
import Pagination from "@/components/core/pagination/Pagination";
import { User } from "@/types/auth/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCookie } from "cookies-next/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";

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
    search,
  }: {
    page: number;
    pageSize: number;
    search: string;
  }) => {
    const params = new URLSearchParams();
    if (page) params.set("page", page.toString());
    if (pageSize) params.set("page_size", pageSize.toString());
    if (search) params.set("username", search);
    const res = await fetch(`/api/users?${params}`);
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
        body: JSON.stringify({ is_banned: !user?.is_banned || true }),
      });
      if (!res.ok) {
        throw new Error("Failed to ban user");
      }
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
    <Suspense fallback={<Loading />}>
      <AdminManager
        banAction={(uuid: string) => banUserMutation.mutate(uuid)}
        changeEloAction={(uuid: string, elo: number) =>
          changeEloMutation.mutate({ uuid, elo })
        }
      >
        <Pagination<User> queryKey={["users"]} fetcherAction={fetchItems}>
          <article className="flex flex-col">
            <div className="px-[5%] pt-[3%] pb-[3%]">
              <PagedSearchBar />
            </div>
            <PagedItems<User>>
              {(items) => (
                <ul className="px-[5%] pb-[5%] space-y-2">
                  {items.map((item) => (
                    <TableItem key={item.uuid} {...item} />
                  ))}
                  {items.length === 0 && (
                    <div className="text-center">Žádné výsledky</div>
                  )}
                </ul>
              )}
            </PagedItems>
            <div className="flex-1" />
            <PageSelector />
          </article>
        </Pagination>
      </AdminManager>
    </Suspense>
  );
}

function TableItem(item: User) {
  const { ban, changeElo } = useAdminManager();

  return (
    <li
      key={item.uuid}
      className="p-4 space-x-2 grid grid-cols-[15%,37%,25.5%,22.5%] text-center items-center font-bold text-3xl bg-black rounded-lg"
    >
      <Link
        href={`/profile/${item.uuid}`}
        className="flex text-center items-center"
      >
        <Image
          src={item.avatar || "/img/avatar.svg"}
          alt={item.username}
          width={64}
          height={64}
          className="min-h-[64px] min-w-[64px] rounded-lg bg-white mr-2"
        />
        {item.username} <span className="text-gray-400 ml-1">({item.elo})</span>
      </Link>
      <span />
      <button
        onClick={() => changeElo(item.username, item.uuid, item.elo)}
        className="rounded-lg p-2 flex flex-center"
      >
        <div
          className="w-[38px] h-[38px] bg-black dark:bg-white mr-1"
          style={{
            WebkitMaskImage: "url(/img/edit_icon.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        ></div>
        Úprava Ela
      </button>
      <button
        onClick={() => ban(item.username, item.uuid)}
        className={`flex flex-center rounded-lg p-2 ${item.is_banned ? "text-blue-light dark:text-blue-dark" : "text-red-light dark:text-red-dark"}`}
      >
        <div
          className={`w-[38px] h-[38px] mr-1 ${item.is_banned ? "bg-blue-light dark:bg-blue-dark" : "bg-red-light dark:bg-red-dark"}`}
          style={{
            WebkitMaskImage: "url(/img/ban_icon.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
          }}
        ></div>
        {item.is_banned ? "Unban" : "Ban"}
      </button>
    </li>
  );
}
