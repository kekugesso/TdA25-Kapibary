import { useErrorModal } from "@/components/core/ErrorModalProvider";
import { useCallback, useRef, useState, useEffect } from "react";

export default function useGameConnection({
  uuid,
  handleMessage,
}: {
  uuid: string;
  handleMessage: (message: MessageEvent) => void;
}) {
  const { displayMessage } = useErrorModal();

  const hardStop = useRef(false);
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const realAttemptCount = useRef(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cleanupWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.onopen = null;
      websocketRef.current.onclose = null;
      websocketRef.current.onerror = null;
      websocketRef.current.onmessage = null;
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, []);

  const createConnection = useCallback(() => {
    if (hardStop.current) return;
    if (websocketRef.current && websocketRef.current?.readyState === 1) {
      setIsConnected(true);
      return;
    }
    if (websocketRef.current) {
      console.log("Cleaning up previous WebSocket instance.");
      cleanupWebSocket();
    }

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const websocket = new WebSocket(
      `${protocol}://${window.location.hostname}:2568/ws/game/${uuid}`,
    );

    websocketRef.current = websocket;

    websocket.onopen = () => {
      console.log("Connected to game server");
      setIsLoading(false);
      setIsConnected(true);
      setReconnectAttempts(0);

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onclose = () => {
      console.log("Disconnected from game server");
      setIsLoading(false);
      setIsConnected(false);
      attemptReconnect();
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      websocket.close();
      setIsConnected(false);
      setIsLoading(false);
    };

    websocket.onmessage = handleMessage;
  }, [uuid, handleMessage]);

  const attemptReconnect = useCallback(() => {
    if (hardStop.current) return;
    if (realAttemptCount.current >= 5) {
      console.log("Max reconnection attempts reached. Stopping.");
      displayMessage(
        "Nepodařilo se nám navázat spojení se serverem. Zkuste to prosím znovu.",
        {
          overrideButtonMessage: "Načíst znovu",
          onClose: () => window.location.reload(),
          disableDefaultButtonAction: true,
        },
      );
      hardStop.current = true;
      return;
    }

    const timeout = Math.min(1000 * 2 ** realAttemptCount.current, 30000);
    realAttemptCount.current += 1;
    setReconnectAttempts((prev) => prev + 1);

    console.log(`Reconnecting in ${timeout / 1000} seconds...`);
    reconnectTimeoutRef.current = window.setTimeout(() => {
      createConnection();
    }, timeout);
  }, [createConnection, displayMessage, realAttemptCount]);

  useEffect(() => {
    if (hardStop.current) return;
    const handleOnline = () => {
      console.log("Network restored. Attempting to reconnect...");
      createConnection();
    };

    const handleOffline = () => {
      console.log("Network lost. Waiting for reconnection...");
      setIsConnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const sendMessage = useCallback(
    (message: object) => {
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify(message));
      } else {
        displayMessage("Failed to contact server!");
      }
    },
    [displayMessage],
  );

  return {
    createConnection,
    sendMessage,
    isConnected,
    isLoading,
    reconnectAttempts,
  };
}
