"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import { BoardType } from "@/types/board/BoardType";
import { MultiplayerGame } from "@/types/multiplayer/game";
import { GameEnd, SymbolMessage } from "@/types/multiplayer/GameEnd";
import GameEndModal from "@/components/multiplayer/game/GameEndModal";
import {
  GameDraw,
  GameMove,
  GameRematch,
  GameSurrender,
  GameWantDraw,
  GameWantSurrender,
  GetGameMove,
} from "@/types/multiplayer/GameEvents";
import { getCookie } from "cookies-next/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { MessageType } from "@/types/multiplayer/MessageType";
import GameWantModal from "./GameWantModal";

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

  turn: "X" | "O" | null;
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
  const {
    user,
    isLogged,
    loading: authLoading,
    isAnonymus,
    logoutAnonymus,
  } = useAuth();
  const { displayMessage } = useErrorModal();

  const websocketRef = useRef<WebSocket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const [userSymbol, setUserSymbol] = useState<"X" | "O" | null>(null);
  const [data, setData] = useState<MultiplayerGame | null>(null);
  const [gameBoard, setGameBoard] = useState<BoardType>([]);
  const [gameEndData, setGameEndData] = useState<GameEnd | null>(null);
  const [winData, setWinData] = useState<SymbolMessage | null>(null);
  const [wantRematch, setWantRematch] = useState(false);
  const [wantDraw, setWantDraw] = useState(false);
  const [turn, setTurn] = useState<"X" | "O" | null>(null);

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
      if (userTime && turn === userSymbol) setUserTime((time) => time - 1);
      if (opponentTime && turn !== userSymbol)
        // @ts-expect-error - TS doesn't know that time is not null
        setOpponentTime((time) => time - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEndData]);

  const handleInitialData = useCallback(
    (data: MultiplayerGame) => {
      setData(data);
      setGameBoard(data.board);
      const symbol =
        data.game_status.find(
          (status) =>
            status.player.uuid ===
            (isLogged ? user?.uuid : getCookie("authToken")),
        )?.symbol ?? null;
      setUserSymbol(symbol);
      setTurn(() =>
        data.board.flat().filter((x) => x === "X").length >
        data.board.flat().filter((o) => o === "O").length
          ? "O"
          : "X",
      );
      setIsLoading(false);
    },
    [isLogged, user],
  );

  const handleMove = useCallback(
    (moveMessage: GetGameMove) => {
      if (moveMessage.end) setGameEndData(moveMessage.end);

      setGameBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[moveMessage.row] = [...prevBoard[moveMessage.row]];
        newBoard[moveMessage.row][moveMessage.column] = moveMessage.symbol;
        return newBoard;
      });
      setTurn((prevTurn) => (prevTurn === "X" ? "O" : "X"));

      // TIME
      if (moveMessage.time)
        if (moveMessage.symbol === userSymbol) setUserTime(moveMessage.time);
        else setOpponentTime(moveMessage.time);
    },
    [userSymbol],
  );

  const handleDraw = useCallback((drawMessage: GameWantDraw) => {
    if (drawMessage.end) setGameEndData(drawMessage.end);
    else setWantDraw(true);
  }, []);
  const handleRematch = useCallback(() => {
    setWantRematch(true);
  }, []);
  const handleSurrender = useCallback((surrenderMessage: GameWantSurrender) => {
    setGameEndData(surrenderMessage.end);
  }, []);

  // handle game end
  useEffect(() => {
    if (!gameEndData) return;
    if (gameEndData.win_board) setGameBoard(gameEndData.win_board);
    setWinData(userSymbol === "X" ? gameEndData.X : gameEndData.O);
    if (isAnonymus) logoutAnonymus();
  }, [gameEndData, userSymbol, isAnonymus, logoutAnonymus]);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case MessageType.init:
          return handleInitialData(message as MultiplayerGame);
        case MessageType.move:
          return handleMove(message as GetGameMove);
        case MessageType.draw:
          return handleDraw(message as GameWantDraw);
        case MessageType.rematch:
          return handleRematch();
        case MessageType.surrender:
          return handleSurrender(message as GameWantSurrender);
        default:
          console.error("Failed to parse WebSocket message:", event.data);
          displayMessage("Invalid message type from server");
      }
    },
    [
      handleInitialData,
      handleMove,
      handleDraw,
      handleRematch,
      handleSurrender,
      displayMessage,
    ],
  );

  useEffect(() => {
    if (!uuid) return;
    if (websocketRef.current) websocketRef.current.close();

    setIsLoading(true);
    const websocket = new WebSocket(
      `ws://${window.location.hostname}:2568/ws/game/${uuid}`,
    );
    websocketRef.current = websocket;

    const handleOpen = () => {
      setIsConnected(true);
      setIsLoading(false);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    websocket.onopen = handleOpen;
    websocket.onclose = handleClose;
    websocket.onmessage = handleMessage;

    return () => {
      websocket.removeEventListener("open", handleOpen);
      websocket.removeEventListener("close", handleClose);
      websocket.removeEventListener("message", handleMessage);
      websocket.close();
    };
  }, [uuid, isLogged, displayMessage, handleMessage]);

  const sendMessage = (message: object) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify(message));
    } else displayMessage("Failed to contact server!");
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
        turn,

        userTime,
        opponentTime,

        wantRematch,
        wantDraw,

        makeMove: (x: number, y: number) => {
          sendMessage({ row: y, column: x } as GameMove);
        },
        surrender: () => {
          sendMessage({ surrender: true } as GameSurrender);
        },
        draw: () => {
          sendMessage({ draw: true } as GameDraw);
        },
        rematch: () => {
          sendMessage({ rematch: true } as GameRematch);
        },
      }}
    >
      {children}
      <GameEndModal
        open={!!winData}
        title={winData?.result ?? ""}
        turn={userSymbol ?? "X"}
        description={winData?.message ?? ""}
        rematchAction={() => {
          setWinData(null);
          sendMessage({ rematch: true } as GameRematch);
        }}
        closeAction={() => setWinData(null)}
      />
      <GameWantModal
        open={wantRematch}
        title="Odveta"
        description="Můžete si okamžitě zahrát odvetu, s odvetou musí souhlasit oba hráči. Chcete proti hráči znovu soupeřit?"
        acceptAction={() => {
          setWantRematch(false);
          sendMessage({ rematch: true } as GameRematch);
        }}
        cancelAction={() => setWantRematch(false)}
      />
      <GameWantModal
        open={wantDraw}
        title="Nabídka remízy"
        description="Váš soupeř nabízí ukončit hru remízou. Chcete hru předčasně ukončit remízou?"
        acceptAction={() => {
          setWantDraw(false);
          sendMessage({ draw: true } as GameDraw);
        }}
        cancelAction={() => setWantDraw(false)}
      />
    </GameManagerContext.Provider>
  );
}

export function useGameManager() {
  const context = useContext(GameManagerContext);
  if (!context)
    throw new Error("useGameManager must be used within a GameManager");
  return context;
}
