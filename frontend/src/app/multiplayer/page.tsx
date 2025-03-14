"use client";
import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import GameContinueModal from "@/components/multiplayer/game/GameContinueModal";
import GameCreationModal from "@/components/multiplayer/lobby/GameCreationModal";
import GameFindModal from "@/components/multiplayer/lobby/GameFindModal";
import GameInviteModal from "@/components/multiplayer/lobby/GameInviteModal";
import GameJoinModal from "@/components/multiplayer/lobby/GameJoinModal";
import GameTypeCard from "@/components/multiplayer/lobby/GameTypeCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { setCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MultiplayerLobby({
  searchParams,
}: {
  searchParams: Promise<{ game?: Promise<string> }>;
}) {
  useEffect(() => {
    async function loadGameCode() {
      try {
        const resolvedParams = await searchParams; // Resolve the params promise
        const resolvedGameCode = await resolvedParams.game; // Resolve the nested game promise
        if (resolvedGameCode) setGameCode(Number.parseInt(resolvedGameCode));
      } catch (error) {
        console.error("Failed to load uuid:", error);
      }
    }
    loadGameCode();
  }, [searchParams]);

  const [gameCode, setGameCode] = useState<number | undefined>(undefined);
  const router = useRouter();
  const { isLogged, getToken } = useAuth();
  const { displayMessage, displayError } = useErrorModal();
  const [findingGame, setFindingGame] = useState(false);
  const [joinGameModal, setJoinGameModal] = useState(false);
  const [createGameModal, setCreateGameModal] = useState(false);
  const [inviteGameModal, setInviteGameModal] = useState(false);

  const createGameMutation = useMutation({
    mutationFn: async (symbol: "X" | "O") => {
      const res = await fetch("/api/freeplay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getToken()}`,
        },
        body: JSON.stringify({ symbol: symbol } as { symbol: "X" | "O" }),
      });
      if (res.status === 401)
        throw new Error("Na vytvoření hry musíš být přihlášený");
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()) as { gameCode: number; uuid: string };
    },
    onError: (error: Error) => error,
  });

  const createGame = (symbol: "X" | "O") => {
    createGameMutation.mutate(symbol, {
      onError: (error) => {
        setCreateGameModal(false);
        displayError(error, {
          overrideButtonMessage: "Zavřít",
          disableDefaultButtonAction: true,
          onClose: () => setCreateGameModal(true),
        });
      },
      onSuccess: (data) => {
        setGameCode(data.gameCode);
        setCreateGameModal(false);
        setInviteGameModal(true);
        localStorage.setItem("multiplayerGame", data.uuid);
      },
    });
  };
  useEffect(() => {
    if (gameCode && !createGameModal && !inviteGameModal) joinGame(gameCode);
  }, [gameCode]);

  const joinFreePlayGameMutation = useMutation({
    mutationFn: async (code: number) => {
      const res = await fetch("/api/freeplay", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() && {
            Authorization: `Token ${getToken()}`,
          }),
        },
        body: JSON.stringify({ code } as { code: number }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      return (await res.json()) as { uuid: string; authtoken?: string };
    },
    onError: (error: Error) => error,
  });

  const joinGame = (code: number) => {
    if (code < 100000 || code > 999999) {
      setJoinGameModal(false);
      displayMessage("Code isn't valid", {
        overrideButtonMessage: "Zavřít",
        disableDefaultButtonAction: true,
        onClose: () => setJoinGameModal(true),
      });
      return;
    }

    joinFreePlayGameMutation.mutate(code, {
      onError: (error) => {
        setJoinGameModal(false);
        console.error(error);
        displayError(error, {
          overrideButtonMessage: "Zavřít",
          disableDefaultButtonAction: true,
          onClose: () => setJoinGameModal(true),
        });
      },
      onSuccess: (data) => {
        if (!isLogged && data.authtoken)
          setCookie("anonymous", data.authtoken, {
            expires: new Date(Date.now() + 1000 * 60), // you get 1 minute to connect to the game
          });
        localStorage.setItem("multiplayerGame", data.uuid);
        router.push(`/multiplayer/${data.uuid}`);
      },
    });
  };

  const queueGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
        },
      });
      if (res.status === 400) return res;
      if (res.status === 401)
        throw new Error("Pro matchmaking se musíš přihlásit");
      if (res.status > 250) throw new Error((await res.json()).message);
      return res;
    },
    onError: (error: Error) => error,
  });

  const dequeueGameMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/query", {
        method: "DELETE",
        headers: {
          Authorization: `Token ${getToken()}`,
        },
      });
      if (res.status > 250) throw new Error((await res.json()).message);
      return res;
    },
    onError: (error: Error) => error,
  });

  const findGame = () => {
    queueGameMutation.mutate(undefined, {
      onError: (error) => {
        displayError(error, {
          overrideButtonMessage: "Zavřít",
          disableDefaultButtonAction: true,
        });
      },
      onSuccess: () => {
        setFindingGame(true);
      },
    });
  };

  const getGameQuery = useQuery({
    queryKey: ["getGame"],
    enabled: false,
    queryFn: async () => {
      const res = await fetch("api/rating", {
        headers: {
          Authorization: `Token ${getToken()}`,
        },
      });
      console.log(res);
      if (res.status === 404) return null;
      if (res.status === 200)
        router.push(`/multiplayer/${(await res.json()).uuid}`);
      return null;
    },
  });

  useEffect(() => {
    if (!findingGame) return;
    const timer = setInterval(getGameQuery.refetch, 1000);
    return () => clearInterval(timer);
  }, [findingGame, router, getGameQuery]);

  const [existingGame, setExistingGame] = useState(false);
  useEffect(() => {
    const uuid = localStorage.getItem("multiplayerGame");
    if (!uuid) return;
    setExistingGame(true);
  }, []);

  const clearExistingGame = () => {
    // we need to connect to the game, send surrender and then disconnect
    // and remove the game from local storage
    const uuid = localStorage.getItem("multiplayerGame");
    if (!uuid) {
      localStorage.removeItem("multiplayerGame");
      setExistingGame(false);
      return;
    }
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const websocket = new WebSocket(
      `${protocol}://${window.location.hostname}:2568/ws/game/${uuid}`,
    );
    websocket.onopen = () => {
      websocket.send(JSON.stringify({ surrender: true }));
      websocket.close();
      localStorage.removeItem("multiplayerGame");
      setExistingGame(false);
    };
    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      websocket.close();
    };
  };
  return (
    <article className="flex flex-center flex-col space-y-5 py-[5%] ">
      <h1 className="font-bold text-3xl">
        Najděte soupeře a pusťte se do hry!
      </h1>
      <h2 className="font-bold text-lg">
        Vyberte svůj způsob hry a užijte si piškvorky naplno!
      </h2>
      <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0">
        <GameTypeCard
          title="Hrajte s přáteli"
          description="Vytvořte soukromou místnost a pozvěte kamaráda pomocí jedinečného odkazu. Ukažte, kdo je v piškvorkách nejlepší!"
          image="/img/bulb_highfive.svg"
          imageClassName="h-[150px] w-[200px]"
          redbutton={{
            text: "Vytvořit hru s přáteli",
            onClick: () => setCreateGameModal(true),
          }}
          bluebutton={{
            text: "Připojit se do hry",
            onClick: () => setJoinGameModal(true),
          }}
        />
        <GameTypeCard
          title="Matchmaking"
          description="Klikněte a utekejte se s náhodným hráčem. Soutěžte spolu a postupujte v žebříčku. Každá hra se počítá!"
          image="/img/bulb_play.svg"
          redbutton={{ text: "Najít hru", onClick: findGame }}
          bluebutton={{
            text: "Žebříček",
            onClick: () => router.push("/leaderboard"),
          }}
        />
        <GameFindModal
          open={findingGame}
          cancelAction={() => {
            dequeueGameMutation.mutate();
            setFindingGame(false);
          }}
        />
        <GameJoinModal
          open={joinGameModal}
          cancelAction={() => setJoinGameModal(false)}
          joinAction={joinGame}
        />
        <GameCreationModal
          open={createGameModal}
          createAction={createGame}
          cancelAction={() => setCreateGameModal(false)}
        />
        <GameInviteModal
          open={inviteGameModal}
          gameCode={gameCode || 0}
          cancelAction={() => setInviteGameModal(false)}
          joinAction={() =>
            router.push(
              `/multiplayer/${localStorage.getItem("multiplayerGame")}`,
            )
          }
        />
        <GameContinueModal
          open={existingGame}
          joinAction={() =>
            router.push(
              `/multiplayer/${localStorage.getItem("multiplayerGame")}`,
            )
          }
          cancelAction={clearExistingGame}
        />
      </div>
    </article>
  );
}
