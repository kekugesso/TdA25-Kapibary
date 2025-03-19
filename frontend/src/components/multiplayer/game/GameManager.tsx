"use client";

import { useAuth } from "@/components/core/AuthProvider";
import { useErrorModal } from "@/components/core/ErrorModalProvider";
import { BoardType } from "@/types/board/BoardType";
import { GameTime, MultiplayerGame } from "@/types/multiplayer/game";
import { GameEnd, SymbolMessage } from "@/types/multiplayer/GameEnd";
import GameEndModal from "@/components/multiplayer/game/GameEndModal";
import {
  GameDraw,
  GameError,
  GameMove,
  GameRematch,
  GameSurrender,
  GameTimeLimit,
  GameWantDraw,
  GameWantRematch,
  GameWantSurrender,
  GetGameMove,
  GetGameTime,
} from "@/types/multiplayer/GameEvents";
import { getCookie } from "cookies-next/client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MessageType } from "@/types/multiplayer/MessageType";
import GameWantModal from "./GameWantModal";
import { GameResult } from "@/types/multiplayer/GameResult";
import { useRouter } from "next/navigation";
import GameInfoModal from "./GameInfoModal";
import useGameConnection from "./GameConnection";
import { setCookie } from "cookies-next";
import GameDisconnectionModal from "./GameDisconnectModal";

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
  userType: "player" | "spectator" | null
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
  const { user, isLogged, loading: isAuthLoading } = useAuth();
  const { displayMessage } = useErrorModal();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const [userSymbol, setUserSymbol] = useState<"X" | "O" | null>(null);
  const [userType, setUserType] = useState<"player" | "spectator" | null>(null);

  const [data, setData] = useState<MultiplayerGame | null>(null);
  const [gameBoard, setGameBoard] = useState<BoardType>([]);
  const [gameEndData, setGameEndData] = useState<GameEnd | null>(null);
  const [endData, setEndData] = useState<SymbolMessage | null>(null);

  const [turn, setTurn] = useState<"X" | "O" | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const [userTime, setUserTime] = useState<number | null>(null);
  const [opponentTime, setOpponentTime] = useState<number | null>(null);

  const [wantRematch, setWantRematch] = useState(false);
  const [openRematchModal, setOpenRematchModal] = useState(false);
  const [rejectRematch, setRejectRematch] = useState(false);

  const [wantDraw, setWantDraw] = useState(false);
  const [openDrawModal, setOpenDrawModal] = useState(false);
  const [rejectDraw, setRejectDraw] = useState(false);

  const setTimeData = useCallback(
    (timeData: GameTime) => {
      setUserTime(userSymbol === "X" ? timeData.X.time : timeData.O.time);
      setOpponentTime(userSymbol === "X" ? timeData.O.time : timeData.X.time);
    },
    [userSymbol],
  );

  const handleInitialData = useCallback(
    (data: MultiplayerGame) => {
      setData(data);
      setGameBoard(data.board);
      setGameEnded(data.game_status[0].result !== GameResult.UNKNOWN);

      const userSymbol =
        data.game_status.find((status) => status.player.uuid === user?.uuid)
          ?.symbol ?? (data.game_status[0].symbol === "X" ? "O" : "X");
      setUserSymbol(userSymbol);
      setTurn(() =>
        data.board.flat().filter((x) => x === "X" || x === "Xw").length >
        data.board.flat().filter((o) => o === "O" || o === "Ow").length
          ? "O"
          : "X",
      );
      if (data.time) {
        setUserTime(userSymbol === "X" ? data.time.X.time : data.time.O.time);
        setOpponentTime(
          userSymbol === "X" ? data.time.O.time : data.time.X.time,
        );
      }

      if (data.spectator) setUserType("spectator");
      else setUserType("player");
      setIsLoading(false);
    },
    [user],
  );

  const handleMove = useCallback(
    (moveMessage: GetGameMove) => {
      setGameBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[moveMessage.row] = [...prevBoard[moveMessage.row]];
        newBoard[moveMessage.row][moveMessage.column] = moveMessage.symbol;
        return newBoard;
      });
      setTurn((prevTurn) => (prevTurn === "X" ? "O" : "X"));

      if (moveMessage.time) setTimeData(moveMessage.time);
      if (moveMessage.end) setGameEndData(moveMessage.end);
    },
    [setTimeData],
  );

  const handleTime = useCallback(
    (timeMessage: GetGameTime) => {
      if (timeMessage.time) setTimeData(timeMessage.time);
      if (timeMessage.end) setGameEndData(timeMessage.end);
    },
    [setTimeData],
  );

  const handleDraw = useCallback(
    (drawMessage: GameWantDraw) => {
      if (!userType || userType === "spectator") return;
      if (!drawMessage.draw && wantDraw) {
        setRejectDraw(true);
        setWantDraw(false);
        return;
      }
      if (drawMessage.end) setGameEndData(drawMessage.end);
      if (drawMessage.draw_to === (isLogged ? user?.uuid : "anonymous"))
        setOpenDrawModal(true);
    },
    [isLogged, user, wantDraw, userType],
  );

  const handleRematch = useCallback(
    (rematchMessage: GameWantRematch) => {
      if (!rematchMessage.rematch && wantRematch) {
        setRejectRematch(true);
        setWantRematch(false);
        return;
      }
      if (rematchMessage.new_game)
        router.push(`/multiplayer/${rematchMessage.new_game}`);
      if (!userType || userType === "spectator") return;
      if (rematchMessage.rematch_to === (isLogged ? user?.uuid : "anonymous"))
        setOpenRematchModal(true);
    },
    [isLogged, user, router, wantRematch, userType],
  );
  const handleSurrender = useCallback((surrenderMessage: GameWantSurrender) => {
    setGameEndData(surrenderMessage.end);
  }, []);
  const handleError = useCallback(
    (error: GameError) => {
      console.error("Server error:", error.message);
      setIsError(true);
      displayMessage(error.message, {
        disableDefaultButtonAction: true,
        overrideButtonMessage: "Zpět do lobby",
        onClose: () => router.push("/multiplayer"),
      });
    },
    [displayMessage, router],
  );

  // handle game end
  useEffect(() => {
    if (!gameEndData) return;

    localStorage.removeItem("multiplayerGame");
    if (gameEndData.win_board) setGameBoard(gameEndData.win_board);
    setEndData(userSymbol === "X" ? gameEndData.X : gameEndData.O);
  }, [gameEndData, userSymbol]);

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
          return handleRematch(message as GameWantRematch);
        case MessageType.surrender:
          return handleSurrender(message as GameWantSurrender);
        case MessageType.time:
          return handleTime(message as GetGameTime);
        case MessageType.error:
          return handleError(message as GameError);
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
      handleTime,
      handleError,
      displayMessage,
    ],
  );

  const {
    createConnection,
    reconnectAttempts,
    sendMessage,
    isConnected,
    isLoading: isConnectionLoading,
  } = useGameConnection({
    uuid,
    handleMessage,
    isError,
  });

  useEffect(() => {
    if (!getCookie("anonymous")) return;
    if (!userType || userType === "spectator") return;

    const cycleTimeMs = 1000 * 60 * 5; // 5 minutes
    const setCookies = () => {
      setCookie("authToken", getCookie("anonymous"), {
        expires: new Date(Date.now() + cycleTimeMs),
      });
      setCookie("anonymous", getCookie("anonymous"), {
        expires: new Date(Date.now() + cycleTimeMs),
      });
    };
    setCookies();
    const anonymousLifeCycle = setInterval(
      () => {
        if (getCookie("anonymous")) setCookies();
        else clearInterval(anonymousLifeCycle);
      },
      cycleTimeMs - 1000 * 30,
    ); // 30 seconds before expiration
    return () => clearInterval(anonymousLifeCycle);
  }, [userType]);

  // create first connection
  useEffect(() => {
    if (isAuthLoading) return;
    // here can be a race condition with the anonymous lifecycle, but it's not a problem
    // so we can ignore it for now
    createConnection();
  }, [isAuthLoading, createConnection]);

  useEffect(() => {
    if (
      userTime === null ||
      opponentTime === null ||
      data?.game_status[0].result !== GameResult.UNKNOWN
    )
      return;

    const interval = setInterval(() => {
      if (!gameEndData && (userTime <= 0 || opponentTime <= 0)) {
        sendMessage({ time: true } as GameTimeLimit);
        clearInterval(interval);
        return;
      }
      if (gameEndData) {
        clearInterval(interval);
        return;
      }
      // @ts-expect-error - TS doesn't know that time is not null
      if (userTime && turn === userSymbol) setUserTime((time) => time - 1);
      if (opponentTime && turn !== userSymbol)
        // @ts-expect-error - TS doesn't know that time is not null
        setOpponentTime((time) => time - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [
    gameEndData,
    userTime,
    opponentTime,
    turn,
    userSymbol,
    sendMessage,
    data,
  ]);

  return (
    <GameManagerContext.Provider
      value={{
        isLoading: isLoading || isConnectionLoading || isAuthLoading,
        isConnected,

        data,
        board: gameBoard,
        endData: gameEndData,
        userSymbol,
        userType,
        turn,

        userTime,
        opponentTime,

        wantRematch,
        wantDraw,

        makeMove: (x: number, y: number) => {
          if (!userType || userType === "spectator") return;
          sendMessage({ row: y, column: x } as GameMove);
        },
        surrender: () => {
          if (!userType || userType === "spectator") return;
          sendMessage({ surrender: true } as GameSurrender);
        },
        draw: () => {
          if (!userType || userType === "spectator") return;
          setWantDraw(true);
          sendMessage({ draw: true } as GameDraw);
        },
        rematch: () => {
          if (!userType || userType === "spectator") return;
          setWantRematch(true);
          sendMessage({ rematch: true } as GameRematch);
        },
      }}
    >
      {children}
      <GameEndModal
        open={!!endData && userType !== "spectator"}
        title={endData?.result ?? ""}
        turn={userSymbol ?? "X"}
        description={endData?.message ?? ""}
        rematchAction={() => {
          if (!userType || userType === "spectator") return;
          setEndData(null);
          setWantRematch(true);
          sendMessage({ rematch: true } as GameRematch);
        }}
        closeAction={() => setEndData(null)}
      />
      <GameWantModal
        open={openRematchModal}
        title="Odveta"
        description="Můžete si okamžitě zahrát odvetu, s odvetou musí souhlasit oba hráči. Chcete proti hráči znovu soupeřit?"
        acceptAction={() => {
          if (!userType || userType === "spectator") return;
          setOpenRematchModal(false);
          setWantRematch(true);
          sendMessage({ rematch: true } as GameRematch);
        }}
        cancelAction={() => {
          if (!userType || userType === "spectator") return;
          setOpenRematchModal(false);
          setEndData(null);
          sendMessage({ rematch: false } as GameRematch);
        }}
      />
      <GameInfoModal
        open={rejectRematch}
        title="Zamítnutí odvety"
        description="Váš soupeř odmítl vaši nabídku odvety."
        closeAction={() => setRejectRematch(false)}
      />
      <GameWantModal
        open={openDrawModal}
        title="Nabídka remízy"
        description="Váš soupeř nabízí ukončit hru remízou. Chcete hru předčasně ukončit remízou?"
        acceptAction={() => {
          if (!userType || userType === "spectator") return;
          setOpenDrawModal(false);
          sendMessage({ draw: true } as GameDraw);
        }}
        cancelAction={() => {
          if (!userType || userType === "spectator") return;
          setOpenDrawModal(false);
          sendMessage({ draw: false } as GameDraw);
        }}
      />
      <GameInfoModal
        open={rejectDraw}
        title="Zamítnutí remízy"
        description="Váš soupeř odmítl vaši nabídku remízy."
        closeAction={() => setRejectDraw(false)}
      />
      <GameDisconnectionModal
        open={!isConnected && !isLoading}
        tries={reconnectAttempts}
        retryAction={createConnection}
      />
      <GameInfoModal
        open={gameEnded}
        title="Konec hry"
        description="Vypadá to, že hra už skončila."
        closeAction={() => setGameEnded(false)}
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
