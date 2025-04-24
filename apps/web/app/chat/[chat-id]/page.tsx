'use client'

import { useChatPage } from "./use-chat-page";
import { Chat } from "./chat";
import { Message } from "./message";

export default function ChatPage() {
  const { messages, userId , sendMessage} = useChatPage()

  return (
    <div className="max-w-lg mx-auto flex flex-col h-screen py-5 gap-4">
      <h1 className="text-center text-lg font-bold">dangai.chat</h1>
      <ul className="flex-1 overflow-y-auto flex flex-col gap-2 px-2">
        {messages.map(message => (
          <Message message={message} key={message.id} userId={userId ?? ''} />
        ))}
      </ul>

      {/* Input de chat fixado no final */}
      <Chat sendMessage={sendMessage} />
    </div>

  )
}
