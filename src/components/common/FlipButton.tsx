import { type ReactNode, useState } from 'react'
import { motion, type MotionProps } from 'framer-motion'
import { Link } from 'react-router-dom'

interface FlipButtonProps extends MotionProps {
  variant?: 'pantone' | 'glass' | 'gold'
  size?: 'md' | 'lg'
  to?: string
  href?: string
  children: ReactNode
  className?: string
}

const easing = [0.16, 1, 0.3, 1] as const

const variantStyles: Record<string, string> = {
  pantone: 'bg-maroon text-ivory rounded-full border border-teal-dark/10',
  glass: 'bg-ivory/60 backdrop-blur-md text-teal-dark rounded-full border border-teal-dark/15',
  gold: 'bg-accent-gold text-teal-dark rounded-full',
}

const sizeStyles: Record<string, string> = {
  md: 'px-6 py-3 text-sm font-medium',
  lg: 'px-8 py-4 text-[16px] font-display font-medium',
}

const MotionLink = motion.create(Link)
const MotionAnchor = motion.create('a')

export default function FlipButton({
  variant = 'pantone',
  size = 'md',
  to,
  href,
  children,
  className = '',
  ...props
}: FlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const isString = typeof children === 'string'
  const shouldNudge = isString && (children.endsWith('→') || children.endsWith('↗'))

  const baseClass = `relative overflow-hidden inline-flex items-center justify-center cursor-pointer transition-shadow duration-300 shadow-card hover:shadow-elevated ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
  const animProps = {
    animate: { scale: isHovered ? 1.02 : 1 },
    transition: { duration: 0.3, ease: easing },
    onHoverStart: () => setIsHovered(true),
    onHoverEnd: () => setIsHovered(false),
    ...props,
  }

  const content = (
    <span className="relative overflow-hidden inline-block">
      <motion.span
        className="inline-block"
        animate={{
          y: isHovered ? '-100%' : '0%',
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: easing }}
      >
        <span
          className={`inline-flex items-center gap-2 ${shouldNudge && isHovered ? 'translate-x-1' : ''}`}
        >
          {children}
        </span>
      </motion.span>
      <motion.span
        className="absolute left-0 top-full inline-flex items-center"
        animate={{
          y: isHovered ? '-100%' : '0%',
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: easing }}
      >
        <span
          className={`inline-flex items-center gap-2 ${shouldNudge && isHovered ? 'translate-x-1' : ''}`}
        >
          {children}
        </span>
      </motion.span>
    </span>
  )

  if (to) {
    return (
      <MotionLink to={to} className={baseClass} {...animProps}>
        {content}
      </MotionLink>
    )
  }
  if (href) {
    return (
      <MotionAnchor href={href} target="_blank" rel="noopener noreferrer" className={baseClass} {...animProps}>
        {content}
      </MotionAnchor>
    )
  }
  return (
    <motion.button className={baseClass} {...animProps}>
      {content}
    </motion.button>
  )
}
