import { cn } from "@workspace/ui/lib/utils"
import type { Message } from "./use-chat-page"
import { RelativeTimeCard } from "../../../../../packages/ui/src/components/relative-time-card"

interface MessageProps {
  message: Message
  userId: string
}

export function Message({message,userId}: MessageProps) {
  const isActualUser = message.userId === userId

  return (
    <li className="flex flex-col">
      <div className={cn(isActualUser ? 'ml-auto bg-foreground text-muted' : 'bg-muted', 'p-2 rounded-lg w-full max-w-sm whitespace-pre-wrap break-words')}>
        {message.text}
      </div>
      <RelativeTimeCard date={message.date} variant="muted" className={cn(isActualUser && 'ml-auto')} />
    </li>
  )
}
