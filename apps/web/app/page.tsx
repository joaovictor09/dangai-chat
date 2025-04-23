'use client'

import { Button } from "@workspace/ui/components/button"
import { useState } from "react"

export default function Page() {
  const [messages, setMessages] = useState<string[]>([])
  const ws = new WebSocket('ws://localhost:3333/ws')

  ws.onopen = () => {
    console.log("Conexão WebSocket estabelecida.");
  };

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  )
}
