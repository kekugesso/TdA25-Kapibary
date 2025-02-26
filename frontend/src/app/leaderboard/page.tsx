"use client";
import PagedItems from "@/components/core/pagination/PagedItems";
import PageSelector from "@/components/core/pagination/PageSelector";
import Pagination from "@/components/core/pagination/Pagination";
import { User } from "@/types/auth/user";
import Image from "next/image";

export default function Leaderboard() {
  const fetchItems = async ({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }) => {
    const res = await fetch(`/api/top?page=${page}&page_size=${pageSize}`);
    if (!res.ok) {
      throw new Error("Failed to fetch leaderboards");
    }
    return await res.json();
  };

  return (
    <Pagination<User> queryKey={["leaderboards"]} fetcherAction={fetchItems}>
      <article className="flex flex-col">
        <PagedItems<User>>
          {(items) => (
            <ul className="p-[5%] space-y-2">
              {items.map((item, index) => (
                <>
                  {index === 0 && (
                    <div className="p-2 -mb-3 grid grid-cols-[7.5%,17%,18%,15%,35%,7.5%] text-xl text-center items-center">
                      <span>Pořadí</span>
                      <span>Uživatel</span>
                      <span />
                      <span>Výhry/Prohry/Remízy</span>
                      <span />
                      <span>Elo</span>
                    </div>
                  )}
                  <li
                    key={item.uuid}
                    className="p-2 grid grid-cols-[7.5%,7.5%,30%,10%,37.5%,7.5%] text-center items-center font-bold text-3xl bg-black rounded-lg"
                  >
                    <span>{item.position || index}.</span>
                    <span className="flex flex-center">
                      <Image
                        src={item.avatar || "/img/avatar.svg"}
                        alt={item.username}
                        width={64}
                        height={64}
                        className="rounded-lg bg-white"
                      />
                    </span>
                    <span className="text-start">{item.username}</span>
                    <span>{`${item.wins}/${item.draws}/${item.losses}`}</span>
                    <span />
                    <span>{item.elo}</span>
                  </li>
                </>
              ))}
            </ul>
          )}
        </PagedItems>
        <div className="flex-1" />
        <PageSelector />
      </article>
    </Pagination>
  );
}
