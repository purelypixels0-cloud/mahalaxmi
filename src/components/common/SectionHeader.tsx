import { type ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  centered?: boolean
  children?: ReactNode
}

export default function SectionHeader({
  title,
  subtitle,
  centered = true,
  children,
}: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display text-teal-dark tracking-wide">
        {title}
      </h2>
      <div
        className={`mt-4 mb-4 w-14 h-0.5 bg-accent-gold ${centered ? 'mx-auto' : ''}`}
      />
      {subtitle && (
        <p className="text-base md:text-lg text-teal-dark/70 font-body max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  )
}
