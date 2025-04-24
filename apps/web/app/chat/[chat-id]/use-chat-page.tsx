import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

export type Message = {
  id: string
  text: string
  userId: string
  date: string
}

export function useChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [wsState, setWsState] = useState<number>(WebSocket.CONNECTING);
  const [userId, setUserId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnecting = useRef(false);
  const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL!;

  useEffect(() => {
    setUserId(uuidv4());

    function connectWebSocket() {
      const ws = new WebSocket(socketUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket conectado.");
        setWsState(ws.OPEN);
        reconnecting.current = false;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, { ...data }]);
        } catch (e) {
          console.error("Erro ao parsear mensagem:", e);
        }
      };

      ws.onclose = () => {
        console.warn("WebSocket desconectado.");
        setWsState(ws.CLOSED);

        if (!reconnecting.current) {
          reconnecting.current = true;
          setTimeout(() => {
            console.log("Tentando reconectar...");
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      socketRef.current?.close();
    };
  }, [socketUrl]);

  function sendMessage(message: string) {
    if (!message || !userId) return;

    const messageId = uuidv4();
    const socket = socketRef.current;

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "message",
        id: messageId,
        text: message,
        userId: userId,
      }));
    } else {
      console.warn("WebSocket não está conectado.");
    }
  }

  const isConnected = () => wsState === WebSocket.OPEN;

  return {
    wsState,
    isConnected,
    sendMessage,
    messages,
    userId,
  };
}
