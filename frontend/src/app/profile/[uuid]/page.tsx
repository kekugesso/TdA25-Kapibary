"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import Loading from "@/components/core/Loading";
import GameHistoryGraph from "@/components/profile/GameHistoryGraph";
import GameHistoryTable from "@/components/profile/GameHistoryTable";
import { GameHistory, User } from "@/types/auth/user";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Profile({
  params,
}: {
  params: Promise<{ uuid: Promise<string> }>;
}) {
  const [uuid, setUuid] = useState<string | null>(null);

  useEffect(() => {
    async function loadUuid() {
      try {
        const resolvedParams = await params; // Resolve the params promise
        const resolvedUuid = await resolvedParams.uuid; // Resolve the nested uuid promise
        setUuid(resolvedUuid);
      } catch (error) {
        console.error("Failed to load uuid:", error);
      }
    }
    loadUuid();
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [gameHistory, setGameHistory] = useState<GameHistory[] | null>(null);
  window.setGameHistory = setGameHistory;
  const { loading: authLoading, user: authUser } = useAuth();
  const { displayError } = useErrorModal();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!uuid) return;
    if (authUser && authUser.uuid === uuid) {
      setUser(authUser);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${uuid}`);
        if (response.status === 404)
          throw new Error((await response.json()).message);
        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUser(data);
      } catch (error) {
        displayError(error as Error, {
          defaultMessage: "Failed to fetch user data",
        });
      } finally {
        setLoading(false);
      }
    };

    if (loading) fetchUser();
  }, [uuid, authUser, displayError, authLoading, loading]);

  useEffect(() => {
    if (!uuid) return;
    if (gameHistory) return;

    const fetchGameHistory = async () => {
      try {
        const response = await fetch(`/api/users/${uuid}/game_history`);
        if (!response.ok) throw new Error("Failed to fetch game history");
        const data = await response.json();
        setGameHistory(data);
      } catch (error) {
        displayError(error as Error, {
          defaultMessage: "Failed to fetch game history",
        });
      }
    };

    fetchGameHistory();
  }, [uuid, displayError, gameHistory]);

  const formatedDate = (date: string) => {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
  };

  return loading || !user ? (
    <Loading />
  ) : (
    <article className="relative flex flex-col py-[8%] px-[15%]">
      {authUser?.uuid === uuid && (
        <Image
          src="/img/edit_icon.svg"
          alt="Edit Profile"
          width={40}
          height={40}
          className="absolute cursor-pointer top-[5%] right-[5%] dark:invert transition-all hover:scale-110"
          onClick={() => router.push("/profile/settings")}
        />
      )}
      <div className="flex space-x-5 p-2 flex-col sm:flex-row flex-center sm:justify-normal sm:items-center">
        <Image
          src={user.avatar || "/img/bulb.svg"}
          alt="Profile Picture"
          width={150}
          height={150}
          className="min-w-[150px] max-w-[150px] min-h-[150px] max-h-[150px] rounded-lg bg-black-dark dark:bg-white-dark text-white-dark dark:text-black-dark flex flex-center"
        />
        <div className="flex flex-col space-y-2">
          <h1 className="text-5xl text-center sm:text-left font-bold">
            {user.username}
          </h1>
          <p className="text-sm text-center sm:text-left">
            S námi od: {formatedDate(user.createdAt)}
          </p>
          <div className="flex h-full space-x-10">
            {[
              { title: "Výhry:", value: user.wins },
              { title: "Remízy:", value: user.draws },
              { title: "Prohry:", value: user.losses },
              { title: "Elo:", value: user.elo },
            ].map(({ title, value }) => (
              <div key={title} className="flex flex-col h-full justify-between">
                <div className="text-xl">{title}</div>
                <div className="font-bold text-4xl text-center">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="relative mt-5 max-h-[300px] w-full">
        {!gameHistory ? (
          <Loading height="min-h-[300px]" />
        ) : (
          <GameHistoryGraph gameHistory={gameHistory} />
        )}
      </div>
      <div className="relative mt-5 max-h-[300px] w-full">
        {!gameHistory || !user ? (
          <Loading height="min-h-[150px]" />
        ) : (
          <GameHistoryTable userData={user} gameHistory={gameHistory} />
        )}
      </div>
    </article>
  );
}
