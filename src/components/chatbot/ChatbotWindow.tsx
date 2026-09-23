import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'bot' | 'user'
}

interface ChatbotWindowProps {
  messages: Message[]
  currentStepId: string | null
  onSendMessage: (text: string) => void
  onClose: () => void
}

export default function ChatbotWindow({
  messages,
  onSendMessage,
  onClose,
}: ChatbotWindowProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSendMessage(text)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="fixed bottom-6 right-6 z-50 flex max-h-[500px] w-[380px] flex-col rounded-2xl bg-ivory-light shadow-elevated"
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-2xl bg-teal-dark px-5 py-3.5 text-ivory">
          <span className="text-sm font-semibold">Mahalaxmi Assistant</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-ivory/60 transition-colors hover:text-ivory"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 px-5 py-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-plum text-ivory rounded-br-md'
                    : 'bg-teal-subtle text-teal-dark rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 border-t border-teal-subtle px-4 py-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-ivory px-4 py-2 text-sm text-teal-dark outline-none placeholder:text-teal-muted"
          />
          <button
            type="button"
            onClick={handleSend}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum text-ivory transition-colors hover:bg-plum-muted"
            aria-label="Send message"
          >
            <Send size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
