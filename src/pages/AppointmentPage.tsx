import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, CheckCircle, MessageCircle, ChevronLeft, CalendarCheck } from 'lucide-react'
import SectionHeader from '../components/common/SectionHeader'
import { easing } from '../router/AppRouter'
import { useCmsKV } from '../lib/content'
import { WHATSAPP_NUMBER } from '../config/contact'

const showroomFallback = {
  address: 'Balasore, Odisha, India',
  phone: '+91 9937012345',
  email: 'hello@mahalaxmijewellery.com',
  hours: ['Monday – Saturday: 10:00 AM – 9:00 PM', 'Sunday: 11:00 AM – 7:00 PM'],
}

interface ContactSettings {
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string[]
}

const benefits = [
  'Personal 1-on-1 consultation with our master designers',
  'View and try our entire collection in person',
  'Expert advice on gold purity, making charges, and designs',
  'Custom design consultation — bring your sketches or ideas',
  'Complimentary gold valuation of your existing pieces',
  'Refreshments and a relaxed, no-pressure environment',
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-ivory text-sm placeholder:text-ivory/35 focus:outline-none focus:border-accent-gold/60 transition-colors'

export default function AppointmentPage() {
  const live = useCmsKV<ContactSettings>('site_settings', 'contact', {
    phone: showroomFallback.phone,
    whatsapp: WHATSAPP_NUMBER,
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
  const whatsappNumber = live.data.whatsapp || WHATSAPP_NUMBER
  const infoRows = [
    { Icon: MapPin, label: 'Address', value: showroomInfo.address },
    { Icon: Phone, label: 'Phone', value: showroomInfo.phone, href: `tel:${showroomInfo.phone}` },
    { Icon: Mail, label: 'Email', value: showroomInfo.email, href: `mailto:${showroomInfo.email}` },
    { Icon: Clock, label: 'Hours', value: showroomInfo.hours },
  ]
  return (
    <div className="pt-24 pb-24 md:pb-36 bg-ivory min-h-screen">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easing }}>
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-teal-dark/50 hover:text-teal-dark transition-colors mb-8">
              <ChevronLeft size={16} /> Home
            </Link>

            <SectionHeader title="Book an Appointment" subtitle="Experience the Mahalaxmi difference in person. Let us help you find or create something extraordinary." />

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-8">
                <div className="rounded-[20px] bg-ivory-light border border-teal-subtle p-6 md:p-8 shadow-card">
                  <h3 className="font-display text-[22px] text-maroon">Why Visit Us?</h3>
                  <p className="mt-1.5 font-body text-[14px] text-ink-muted">A visit to Mahalaxmi is an experience in itself.</p>
                  <ul className="mt-6 space-y-4">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-3.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon/10">
                          <CheckCircle size={15} className="text-maroon" />
                        </span>
                        <span className="font-body text-[15px] leading-[1.55] text-ink">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-[20px] bg-white border border-teal-subtle p-6 md:p-8 shadow-card">
                  <h3 className="font-display text-[22px] text-maroon">Showroom Information</h3>
                  <div className="mt-6 space-y-5">
                    {infoRows.map(({ Icon, label, value, href }) => (
                      <div key={label} className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-maroon">
                          <Icon size={18} className="text-ivory" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-maroon">{label}</p>
                          {Array.isArray(value) ? (
                            value.map((v) => (
                              <p key={v} className="text-sm text-ink-muted font-body mt-0.5">{v}</p>
                            ))
                          ) : (
                            <a
                              href={href}
                              className={`text-sm font-body mt-0.5 block ${href ? 'text-ink-muted hover:text-accent-gold transition-colors' : ''}`}
                            >
                              {value}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <a href={`https://wa.me/${whatsappNumber}?text=Hi! I want to book an appointment at your Balasore showroom.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-maroon text-ivory text-[15px] font-body font-medium transition-transform hover:scale-[1.02] active:scale-95">
                  <MessageCircle size={17} /> Book via WhatsApp
                </a>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.12, duration: 0.6, ease: easing }}>
                <div className="rounded-[20px] bg-maroon p-6 md:p-9 shadow-elevated">
                  <span className="font-body text-[11px] tracking-[0.35em] text-tan">REQUEST A VISIT</span>
                  <h3 className="mt-2 font-display text-[26px] md:text-[28px] text-cream">Plan Your Visit</h3>
                  <p className="mt-2 font-body text-[14px] leading-[1.6] text-ivory/60">Share a few details and our team will have everything ready before you arrive.</p>

                  <form onSubmit={(e) => e.preventDefault()} className="mt-8 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name *" required className={inputClass} />
                      <input type="tel" placeholder="Phone Number *" required className={inputClass} />
                    </div>
                    <input type="email" placeholder="Email Address" className={inputClass} />
                    <select className={`${inputClass} [&>option]:bg-maroon`}>
                      <option value="" className="bg-maroon">I am interested in... *</option>
                      <option value="gold" className="bg-maroon">Gold Jewellery</option>
                      <option value="silver" className="bg-maroon">Silver Jewellery</option>
                      <option value="scheme" className="bg-maroon">Gold Savings Scheme</option>
                      <option value="custom" className="bg-maroon">Custom Design</option>
                      <option value="bridal" className="bg-maroon">Bridal Collection</option>
                      <option value="valuation" className="bg-maroon">Gold Valuation</option>
                      <option value="other" className="bg-maroon">Other</option>
                    </select>
                    <input type="date" className={`${inputClass} [color-scheme:dark]`} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <select className={`${inputClass} [&>option]:bg-maroon`}>
                        <option value="" className="bg-maroon">Preferred Time</option>
                        <option value="10-12" className="bg-maroon">10:00 AM – 12:00 PM</option>
                        <option value="12-2" className="bg-maroon">12:00 PM – 2:00 PM</option>
                        <option value="2-4" className="bg-maroon">2:00 PM – 4:00 PM</option>
                        <option value="4-6" className="bg-maroon">4:00 PM – 6:00 PM</option>
                        <option value="6-8" className="bg-maroon">6:00 PM – 8:00 PM</option>
                      </select>
                      <input type="number" placeholder="Number of Guests" min={1} max={10} className={inputClass} />
                    </div>
                    <textarea placeholder="Additional notes or requests..." rows={3} className={`${inputClass} resize-none`} />
                    <button type="submit" className="inline-flex w-full items-center justify-center gap-2 py-3 rounded-full bg-accent-gold text-teal-dark text-sm font-medium shadow-lg transition-all hover:bg-accent-gold/90 hover:scale-[1.02] active:scale-95">
                      <CalendarCheck size={16} /> Confirm Appointment
                    </button>
                    <p className="text-center text-xs text-ivory/40 font-body">No spam, no obligation — we simply confirm your slot.</p>
                  </form>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
