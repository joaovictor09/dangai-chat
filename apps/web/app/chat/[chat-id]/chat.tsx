import { useState } from "react"
import {Input} from '@workspace/ui/components/input'
import { Button } from "@workspace/ui/components/button"

interface ChatProps {
  sendMessage: (message: string) => void
}

export function Chat({sendMessage}:ChatProps) {
  const [message, setMessage] = useState('')

  const handleSendMessage = () => {
    try {
      sendMessage(message)
      setMessage('')
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      handleSendMessage()
    }} className="flex gap-2 mt-auto w-full">
      <Input value={message} onChange={e => setMessage(e.target.value)} autoFocus placeholder="Temporary message..." />
      <Button>
        Send
      </Button>
    </form>
  )
}
