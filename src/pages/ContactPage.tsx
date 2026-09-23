import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, MessageCircle, ExternalLink, Send } from 'lucide-react'
import SectionHeader from '../components/common/SectionHeader'
import { easing } from '../router/AppRouter'
import { useCmsKV } from '../lib/content'

const WHATSAPP_FALLBACK = '919937012345'

const showroomFallback = {
  address: 'Balasore, Odisha, India',
  phone: '+91 9937012345',
  email: 'hello@mahalaxmijewellery.com',
  hours: ['Monday – Saturday: 10:00 AM – 9:00 PM', 'Sunday: 11:00 AM – 7:00 PM'],
}

const socialLinks = [
  { label: 'Facebook', href: '#', icon: 'F' },
  { label: 'Instagram', href: '#', icon: 'I' },
  { label: 'YouTube', href: '#', icon: 'Y' },
  { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_FALLBACK}`, icon: 'W' },
]

interface ContactSettings {
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string[]
}

export default function ContactPage() {
  const live = useCmsKV<ContactSettings>('site_settings', 'contact', {
    phone: showroomFallback.phone,
    whatsapp: WHATSAPP_FALLBACK,
    email: showroomFallback.email,
    address: showroomFallback.address,
    hours: showroomFallback.hours,
  })
  const showroomInfo = {
    address: live.data.address || showroomFallback.address,
    phone: live.data.phone || showroomFallback.phone,
    email: live.data.email || showroomFallback.email,
    hours: live.data.hours && live.data.hours.length > 0 ? live.data.hours : showroomFallback.hours,
  }
  const whatsappNumber = live.data.whatsapp || WHATSAPP_FALLBACK
  const socials = socialLinks.map((s) => (s.label === 'WhatsApp' ? { ...s, href: `https://wa.me/${whatsappNumber}` } : s))
  return (
    <div className="pt-24 pb-24 md:pb-36 bg-ivory min-h-screen">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easing }}>
            <SectionHeader title="Get in Touch" subtitle="We would love to hear from you. Reach out to us through any of the channels below." />

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-ivory-light border border-teal-subtle p-5 hover:shadow-card transition-shadow">
                    <MapPin size={18} className="text-accent-gold" />
                    <p className="mt-3 text-sm font-medium text-teal-dark">Visit Us</p>
                    <p className="text-sm text-teal-dark/60 font-body mt-1">{showroomInfo.address}</p>
                  </div>
                  <div className="rounded-xl bg-ivory-light border border-teal-subtle p-5 hover:shadow-card transition-shadow">
                    <Phone size={18} className="text-accent-gold" />
                    <p className="mt-3 text-sm font-medium text-teal-dark">Call Us</p>
                    <a href={`tel:${showroomInfo.phone}`} className="text-sm text-teal-dark/60 font-body mt-1 block hover:text-accent-gold transition-colors">{showroomInfo.phone}</a>
                  </div>
                  <div className="rounded-xl bg-ivory-light border border-teal-subtle p-5 hover:shadow-card transition-shadow">
                    <Mail size={18} className="text-accent-gold" />
                    <p className="mt-3 text-sm font-medium text-teal-dark">Email Us</p>
                    <a href={`mailto:${showroomInfo.email}`} className="text-sm text-teal-dark/60 font-body mt-1 block hover:text-accent-gold transition-colors">{showroomInfo.email}</a>
                  </div>
                  <div className="rounded-xl bg-ivory-light border border-teal-subtle p-5 hover:shadow-card transition-shadow">
                    <Clock size={18} className="text-accent-gold" />
                    <p className="mt-3 text-sm font-medium text-teal-dark">Store Hours</p>
                    {showroomInfo.hours.map((h, i) => (
                      <p key={i} className="text-sm text-teal-dark/60 font-body">{h}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-ivory-light border border-teal-subtle p-6 md:p-8 shadow-card">
                  <h3 className="text-lg font-display text-teal-dark mb-5">Send Us a Message</h3>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Your Name *" required className="w-full px-4 py-2.5 rounded-lg bg-ivory border border-teal-subtle text-teal-dark text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 transition-colors" />
                      <input type="email" placeholder="Your Email *" required className="w-full px-4 py-2.5 rounded-lg bg-ivory border border-teal-subtle text-teal-dark text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 transition-colors" />
                    </div>
                    <input type="tel" placeholder="Phone Number" className="w-full px-4 py-2.5 rounded-lg bg-ivory border border-teal-subtle text-teal-dark text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 transition-colors" />
                    <select className="w-full px-4 py-2.5 rounded-lg bg-ivory border border-teal-subtle text-teal-dark text-sm focus:outline-none focus:border-accent-gold/50 transition-colors">
                      <option value="">Subject</option>
                      <option value="general">General Enquiry</option>
                      <option value="purchase">Purchase Enquiry</option>
                      <option value="scheme">Gold Scheme</option>
                      <option value="custom">Custom Design</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    <textarea placeholder="Your Message *" required rows={4} className="w-full px-4 py-2.5 rounded-lg bg-ivory border border-teal-subtle text-teal-dark text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 transition-colors resize-none" />
                    <button type="submit" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-plum text-ivory text-sm font-medium hover:bg-plum/90 transition-colors">
                      <Send size={15} /> Send Message
                    </button>
                  </form>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-teal-dark/50">Connect on social:</span>
                  {socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                      className="w-10 h-10 rounded-full bg-ivory-light border border-teal-subtle flex items-center justify-center text-sm font-semibold text-teal-dark/50 hover:border-accent-gold/30 hover:text-accent-gold hover:bg-accent-gold/5 transition-all">
                      {s.icon}
                    </a>
                  ))}
                </div>

                <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-plum text-ivory text-sm font-medium hover:bg-plum/90 transition-colors">
                  <MessageCircle size={16} /> Chat on WhatsApp
                </a>
              </div>

              <div className="space-y-6">
                <div className="aspect-[16/11] rounded-2xl bg-gradient-to-br from-teal-muted to-plum-muted flex flex-col items-center justify-center gap-3 shadow-card">
                  <MapPin size={40} className="text-accent-gold/40" />
                  <p className="text-sm text-teal-dark/40 font-body">Interactive map will be displayed here</p>
                  <span className="text-xs text-teal-dark/30">Balasore, Odisha</span>
                </div>
                <a href="https://maps.google.com/?q=Balasore+Odisha+India" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-3 -my-3 text-sm font-medium text-accent-gold hover:text-accent-gold/80 transition-colors">
                  <ExternalLink size={14} /> Open in Google Maps
                </a>

                <div className="rounded-2xl bg-gradient-to-br from-teal-dark to-plum p-6 md:p-8 shadow-elevated mt-8">
                  <h3 className="text-lg font-display text-ivory">Visit Our Showroom</h3>
                  <p className="mt-2 text-sm text-ivory/60 font-body leading-relaxed">
                    Experience our collection in person at our Balasore showroom. Our team is ready to assist you
                    with personalised service, expert advice, and a warm cup of chai.
                  </p>
                  <div className="mt-5 space-y-2 text-sm text-ivory/70 font-body">
                    <p className="flex items-center gap-2"><MapPin size={14} className="text-accent-gold shrink-0" /> {showroomInfo.address}</p>
                    <p className="flex items-center gap-2"><Phone size={14} className="text-accent-gold shrink-0" /> {showroomInfo.phone}</p>
                  </div>
                  <a href={`https://wa.me/${whatsappNumber}?text=Hi! I want to visit your showroom in Balasore.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full bg-accent-gold text-teal-dark text-sm font-medium hover:bg-accent-gold/90 transition-colors">
                    <MessageCircle size={15} /> Get Directions on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
