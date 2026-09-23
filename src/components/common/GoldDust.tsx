import { motion } from 'framer-motion'

interface GoldDot {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

const dots: GoldDot[] = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  opacity: Math.random() * 0.4 + 0.1,
  delay: Math.random() * 3,
  duration: Math.random() * 4 + 3,
}))

export default function GoldDust() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-accent-gold"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            opacity: dot.opacity,
          }}
          animate={{
            y: [0, -12, 0],
            opacity: [dot.opacity, dot.opacity * 1.8, dot.opacity],
          }}
          transition={{
            duration: dot.duration,
            delay: dot.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
