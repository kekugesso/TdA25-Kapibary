"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import { BoardType } from "@/types/board/BoardType";
import { MultiplayerGame } from "@/types/multiplayer/game";
import { GameEnd } from "@/types/multiplayer/GameEnd";
import {
  GameDraw,
  GameMove,
  GameRematch,
  GameSurrender,
  GameWantDraw,
  GameWantRematch,
  GameWantSurrender,
  GetGameMove,
} from "@/types/multiplayer/GameEvents";
import { getCookie } from "cookies-next/client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface GameManagerContextProps {
  isLoading: boolean;
  isConnected: boolean;

  data: MultiplayerGame | null;
  board: BoardType;
  endData: GameEnd | null;

  makeMove: (x: number, y: number) => void;
  surrender: () => void;
  draw: () => void;
  rematch: () => void;

  wantRematch: boolean;
  wantDraw: boolean;

  userSymbol: "X" | "O" | null;
  userTime: number | null;
  opponentTime: number | null;
}

const GameManagerContext = createContext<GameManagerContextProps | null>(null);

export function GameManager({
  uuid,
  children,
}: {
  uuid: string;
  children: React.ReactNode;
}) {
  const { user, isLogged, loading: authLoading } = useAuth();
  const { displayMessage } = useErrorModal();

  const websocketRef = useRef<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [userSymbol, setUserSymbol] = useState<"X" | "O" | null>(null);
  const [data, setData] = useState<MultiplayerGame | null>(null);
  const [gameBoard, setGameBoard] = useState<BoardType>([]);
  const [gameEndData, setGameEndData] = useState<GameEnd | null>(null);
  const [wantRematch, setWantRematch] = useState(false);
  const [wantDraw, setWantDraw] = useState(false);

  const [userTime, setUserTime] = useState<number | null>(null);
  const [opponentTime, setOpponentTime] = useState<number | null>(null);

  useEffect(() => {
    if (!userTime || !opponentTime) return;
    if (gameEndData) {
      setUserTime(null);
      setOpponentTime(null);
    }
    const interval = setInterval(() => {
      // @ts-expect-error - TS doesn't know that time is not null
      if (userTime) setUserTime((time) => time - 1);
      // @ts-expect-error - TS doesn't know that time is not null
      if (opponentTime) setOpponentTime((time) => time - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEndData]);

  const handleMessage = (event: MessageEvent) => {
    try {
      console.log("event", event);
      const message = JSON.parse(event.data) as
        | MultiplayerGame
        | GameWantDraw
        | GameWantRematch
        | GameWantSurrender;

      if ((message as MultiplayerGame)?.gameCode) {
        setData(message as MultiplayerGame);
        setGameBoard((message as MultiplayerGame).board);
        setUserSymbol(
          (message as MultiplayerGame).game_status.find(
            (status) =>
              status.player.uuid ===
              (isLogged ? user?.uuid : getCookie("authToken")),
          )?.symbol ?? null,
        );
        setIsLoading(false);
      } else if ((message as GetGameMove)?.row) {
        if ((message as GetGameMove).end)
          setGameEndData((message as GetGameMove).end);

        // TIME
        if ((message as GetGameMove).time)
          // @ts-expect-error - TS doesn't know that time is not null
          setUserTime((message as GetGameMove).time);
        // @ts-expect-error - TS doesn't know that time is not null
        else setOpponentTime((time) => time + 1);
      } else if ((message as GameWantDraw)?.draw_to) {
        if ((message as GameWantDraw).end)
          setGameEndData((message as GameWantDraw).end);
        else setWantDraw(true);
        window.alert("Draw");
      } else if ((message as GameWantRematch)?.rematch_to) {
        if ((message as GameWantRematch).end)
          setGameEndData((message as GameWantRematch).end);
        setWantRematch(true);
        window.alert("Rematch");
      } else if ((message as GameWantSurrender)?.end) {
        setGameEndData((message as GameWantSurrender).end);
        window.alert("Surrender");
      } else throw new Error("Invalid message from server");
    } catch (error) {
      console.error("Failed to parse WebSocket message:", event.data, error);
      displayMessage("Invalid message from server");
    }
  };

  useEffect(() => {
    const websocket = new WebSocket(
      `ws://${window.location.hostname}:2568/ws/game/${uuid}`,
    );
    websocketRef.current = websocket;
    window.websocket = websocket;

    const handleOpen = () => {
      setIsConnected(true);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    websocketRef.current.onopen = handleOpen;
    websocketRef.current.onclose = handleClose;
    websocketRef.current.onmessage = handleMessage;

    return () => {
      websocket.removeEventListener("open", handleOpen);
      websocket.removeEventListener("close", handleClose);
      websocket.removeEventListener("message", handleMessage);
      websocket.close();
    };
  }, [uuid]);

  const sendMessage = (message: object) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN)
      websocketRef.current.send(JSON.stringify(message));
    else console.error("WebSocket is not open");
  };

  const handleMove = (x: number, y: number) => {
    sendMessage({ row: x, column: y } as GameMove);
    setGameBoard((prevBoard) => {
      const newBoard = [...prevBoard];
      newBoard[y] = [...prevBoard[y]];
      newBoard[y][x] = userSymbol ?? "";
      return newBoard;
    });
  };

  return (
    <GameManagerContext.Provider
      value={{
        isLoading: isLoading || authLoading,
        isConnected,

        data,
        board: gameBoard,
        endData: gameEndData,
        userSymbol,

        userTime,
        opponentTime,

        wantRematch,
        wantDraw,

        makeMove: handleMove,
        surrender: () => {
          sendMessage({ surrender: true } as GameSurrender);
        },
        draw: () => {
          sendMessage({ remiza: true } as GameDraw);
        },
        rematch: () => {
          sendMessage({ rematch: true } as GameRematch);
        },
      }}
    >
      {children}
    </GameManagerContext.Provider>
  );
}

export function useGameManager() {
  const context = useContext(GameManagerContext);
  if (!context)
    throw new Error("useGameManager must be used within a GameManager");
  return context;
}
