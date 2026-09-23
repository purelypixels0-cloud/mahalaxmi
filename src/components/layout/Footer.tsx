import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'

const exploreLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Collection', to: '/collections' },
  { label: 'Schemes', to: '/schemes' },
  { label: 'Journals', to: '/journal' },
]

const socialLinks = [
  { label: 'E-mail', mark: '✉' },
  { label: 'Instagram', mark: 'IG' },
  { label: 'Facebook', mark: 'FB' },
  { label: 'WhatsApp', mark: 'WA' },
]

const googleMapsUrl = 'https://www.google.com/maps?q=Balasore,+Odisha,+India'

export default function Footer() {
  return (
    <footer className="bg-teal-deep text-ivory">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Logo + QR */}
          <div>
            <img
              src="/logo-nav.png"
              alt="Mahalaxmi Jewellery"
              draggable={false}
              className="h-auto w-44 select-none"
            />
            {/* TODO: QR destination not spec'd yet — likely WhatsApp chat, website URL, or vCard; replace white box with generated QR once confirmed */}
            <div className="mt-6 flex h-24 w-24 items-center justify-center rounded-lg bg-white shadow-card" aria-hidden="true" />
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-body text-[13px] font-semibold uppercase tracking-wider text-ivory">Explore</h4>
            <ul className="mt-5 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="font-body text-sm text-tan underline underline-offset-4 transition-colors hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us */}
          <div>
            <h4 className="font-body text-[13px] font-semibold uppercase tracking-wider text-ivory">Visit Us</h4>
            <ul className="mt-5 space-y-3.5">
              <li className="flex items-start gap-3 font-body text-sm text-ivory/70">
                <MapPin size={14} className="mt-0.5 shrink-0 text-tan" />
                <span>Balasore, Odisha, India</span>
              </li>
              <li className="flex items-start gap-3 font-body text-sm text-ivory/70">
                <Clock size={14} className="mt-0.5 shrink-0 text-tan" />
                <span>
                  <span className="block">10am - 8pm Daily</span>
                  <span className="block">Open All Days</span>
                </span>
              </li>
            </ul>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 font-body text-sm text-tan underline underline-offset-4 transition-colors hover:text-ivory">
              Get Directions ↗
            </a>
          </div>

          {/* Get in Touch */}
          <div>
            <h4 className="font-body text-[13px] font-semibold uppercase tracking-wider text-ivory">Get in Touch</h4>
            <ul className="mt-5 space-y-3">
              {/* TODO: replace placeholder hrefs with real contact handles/email once available */}
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href="#" className="inline-flex items-center gap-2 font-body text-sm text-tan underline underline-offset-4 transition-colors hover:text-ivory">
                    <span className="font-body text-[13px] font-medium text-ivory/80">{s.mark}</span> {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-ivory/10" />

        <div className="flex flex-col items-center justify-between gap-2 font-body text-xs text-ivory/70 sm:flex-row">
          <p>&copy; 2026 Mahalaxmi Jewellery. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <a href="#" className="transition-colors hover:text-tan">Privacy Policy</a>
            <span>/</span>
            <a href="#" className="transition-colors hover:text-tan">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}