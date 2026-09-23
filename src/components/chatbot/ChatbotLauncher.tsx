import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

interface ChatbotLauncherProps {
  onClick: () => void
  isOpen: boolean
}

export default function ChatbotLauncher({ onClick, isOpen }: ChatbotLauncherProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-plum text-ivory shadow-lg transition-shadow hover:shadow-xl"
      style={{ display: isOpen ? 'none' : 'flex' }}
      aria-label="Open chat"
    >
      <MessageCircle size={24} />
    </motion.button>
  )
}
