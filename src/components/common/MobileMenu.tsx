import { useEffect, useRef, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Phone } from 'lucide-react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Collections', to: '/collections' },
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'Schemes', to: '/schemes' },
  { label: 'Journal', to: '/journal' },
  { label: 'Contact', to: '/contact' },
]

const easing = [0.16, 1, 0.3, 1] as const

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const location = useLocation()
  const menuRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && menuRef.current) {
        const focusableEls = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        )
        if (focusableEls.length === 0) return

        const first = focusableEls[0]
        const last = focusableEls[focusableEls.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      closeBtnRef.current?.focus()
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-teal-dark flex flex-col"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: easing }}
        >
          <div className="flex items-center justify-end p-6">
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="text-ivory hover:text-accent-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-md p-1"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={`text-2xl font-display tracking-wide transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold rounded-md px-2 py-1 ${
                    isActive
                      ? 'text-accent-gold'
                      : 'text-ivory/80 hover:text-ivory'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 flex justify-center">
            <a
              href="tel:+919937012345"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent-gold text-teal-dark rounded-full font-medium text-sm hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold"
            >
              <Phone size={16} />
              Book Appointment
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
