"use client";
import PagedItems from "@/components/core/pagination/PagedItems";
import PageSelector from "@/components/core/pagination/PageSelector";
import Pagination from "@/components/core/pagination/Pagination";
import { User } from "@/types/auth/user";

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
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.uuid} className="p-2">
                  {item.username}: {item.elo}
                </li>
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
