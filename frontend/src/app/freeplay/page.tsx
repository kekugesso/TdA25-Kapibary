"use client";

import Loading from "@/components/core/Loading";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Freeplay({
  searchParams,
}: {
  searchParams: Promise<{ game?: Promise<string> }>;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;

    async function loadGameCode() {
      try {
        const resolvedParams = await searchParams; // Resolve the params promise
        const resolvedGameCode = await resolvedParams.game; // Resolve the nested game promise
        if (resolvedGameCode)
          router.push(`/multiplayer?game=${resolvedGameCode}`);
        else router.push("/multiplayer");
      } catch (error) {
        console.error("Failed to load uuid:", error);
      }
    }
    loadGameCode();
  }, [searchParams, router]);

  return <Loading />;
}
