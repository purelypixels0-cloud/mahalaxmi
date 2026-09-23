import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import FlipButton from '../common/FlipButton'

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Collections', to: '/collections' },
  { label: 'Schemes', to: '/schemes' },
  { label: 'Journals', to: '/journal' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isHome = pathname === '/'

  return (
    <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${scrolled || !isHome ? 'bg-white/70 backdrop-blur-xl shadow-sm' : ''}`}>
      <div className="mx-auto flex h-20 items-center justify-between px-6 md:px-10">
        <Link
          to="/"
          onClick={() => { window.location.href = '/' }}
          className="flex items-center no-underline"
          aria-label="Mahalaxmi Jewellery — home"
        >
          <img
            src="/logo-nav.png"
            alt="Mahalaxmi Jewellery"
            draggable={false}
            className="h-11 md:h-12 w-auto object-contain select-none"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-7 rounded-full bg-pill-bg backdrop-blur-xl px-8 py-2.5 border border-white/20">
          {links.map((link) => {
            const active = pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`font-display text-[15px] font-medium transition-colors ${active ? 'text-maroon' : 'text-maroon/70 hover:text-maroon'}`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <FlipButton to="/book-appointment" variant="pantone" className="font-display text-[15px]">
            Book a visit <ArrowUpRight size={16} strokeWidth={2} />
          </FlipButton>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-ink"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-white/20"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`py-2.5 font-display text-[15px] transition-colors ${pathname === link.to ? 'text-maroon' : 'text-maroon/70 hover:text-maroon'}`}
                >
                  {link.label}
                </Link>
              ))}
              <FlipButton to="/book-appointment" variant="pantone" className="mt-3 w-full justify-center font-display text-[15px]">
                Book a visit <ArrowUpRight size={16} />
              </FlipButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
