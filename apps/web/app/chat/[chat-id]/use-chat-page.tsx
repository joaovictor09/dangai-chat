import { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import hotkeys from 'hotkeys-js';

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

  const clearChat = useCallback((e?: KeyboardEvent) => {
    if (e) e.preventDefault();
    setMessages([]);
  }, []);

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
          console.log(data)
          if (data.type === 'message') {
            setMessages(prev => [...prev, { ...data }]);
          }
          if (data.type === 'clear') {
            clearChat()
          }
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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Permitir atalhos mesmo em inputs
    hotkeys.filter = () => true;

    hotkeys('ctrl+l', (e) => {
      clearChat(e)
      const socket = socketRef.current;
      socket?.send(JSON.stringify({
        type: 'clear'
      }))
    }
  );
    return () => {
      hotkeys.unbind('ctrl+l');
    };
  }, [clearChat]);


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
