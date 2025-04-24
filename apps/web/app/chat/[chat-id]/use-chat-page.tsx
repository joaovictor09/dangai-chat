import  { useState, useEffect, useRef } from "react";
import {randomUUID} from 'node:crypto'

export type Message = {
  id: string
  text: string
  userId: string
  date: string
}

export function useChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [wsState, setWsState] = useState<number>(WebSocket.CONNECTING);
  const [socket, setSocket] = useState<WebSocket | null>(null); // Guardando o WebSocket no estado
  const [userId, setUserId] = useState<string | null>(null)
  const socketUrl = "ws://localhost:3333/ws";
  const reconnecting = useRef(false); // Usado para controlar a reconexão\

  // Conecta ao WebSocket uma vez quando o componente for montado
  useEffect(() => {
    // Se já existir uma conexão, não cria uma nova
    if (socket) return;

    const newSocket = new WebSocket(socketUrl); // Criando o WebSocket
    setUserId(randomUUID())
    setSocket(newSocket); // Atualizando o estado com a nova instância do WebSocket

    newSocket.onopen = () => {
      console.log("Conexão WebSocket estabelecida.");
      setWsState(newSocket.OPEN);
      reconnecting.current = false; // A reconexão foi bem-sucedida
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prevMessages) => [...prevMessages, {...data}]);
    };

    newSocket.onclose = () => {
      console.log("Conexão WebSocket perdida.");
      setWsState(newSocket.CLOSED);
      // Tentar reconectar, mas apenas se não estiver tentando reconectar já
      if (!reconnecting.current) {
        reconnecting.current = true;
        console.log("Tentando reconectar...");
        setTimeout(() => {
          reconnecting.current = false; // Permitir nova tentativa de reconexão
          connectWebSocket(); // Chama a função de reconexão
        }, 5000); // Espera 5 segundos para reconectar
      }
    };

    newSocket.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      newSocket.close();
      setWsState(newSocket.CLOSED);
    };

    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [socket]); // O useEffect é chamado apenas uma vez para a criação do socket

  // Função de reconexão manual
  function connectWebSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
      const newSocket = new WebSocket(socketUrl); // Criando o WebSocket
      setSocket(newSocket); // Atualizando o estado com a nova instância do WebSocket
    }
  }

  // Enviar mensagem ao WebSocket
  function sendMessage(message: string) {
    if (!message) return;
    const messageId = randomUUID()

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "message", id: messageId, text: message, userId: userId }));
    } else {
      console.warn("WebSocket não está conectado ainda.");
    }
  }

  const isConnected = () => wsState === WebSocket.OPEN;

  return {
    wsState,
    isConnected,
    sendMessage,
    messages,
    userId
  };
}
