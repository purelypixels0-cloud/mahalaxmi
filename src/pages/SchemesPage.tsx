import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, ChevronDown, Calculator, PiggyBank, ArrowRight, CheckCircle, Info } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'
import schemesData from '../data/schemes.json'
import { whatsappLink } from '../config/contact'

gsap.registerPlugin(ScrollTrigger)

interface Scheme { id: string; name: string; tagline: string; durationMonths: number; bonusPercentage: number; minMonthlyInstallment: number; benefits: string[]; terms: string[] }

interface DbScheme {
  id: string; name: string; tagline: string; duration_months: number; bonus_percentage: number
  min_installment: number; benefits: string[]; terms: string[]; sort_order: number
}

const schemesFallback = schemesData as Scheme[]

function useSchemes(): Scheme[] {
  const live = useCmsTable<DbScheme[]>('schemes', [])
  if (live.live && live.data.length > 0) {
    return live.data.map((s) => ({
      id: s.id, name: s.name, tagline: s.tagline ?? '',
      durationMonths: s.duration_months ?? 12, bonusPercentage: Number(s.bonus_percentage) || 0,
      minMonthlyInstallment: Number(s.min_installment) || 0,
      benefits: Array.isArray(s.benefits) ? s.benefits : [],
      terms: Array.isArray(s.terms) ? s.terms : [],
    }))
  }
  return schemesFallback
}

function SchemeCalculator({ scheme }: { scheme: Scheme }) {
  const [monthly, setMonthly] = useState(scheme.minMonthlyInstallment)
  const totalSaved = monthly * scheme.durationMonths
  const bonusAmount = Math.round(totalSaved * (scheme.bonusPercentage / 100))
  const totalValue = totalSaved + bonusAmount

  return (
    <div className="rounded-[20px] border border-teal-subtle bg-white p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center gap-2">
        <Calculator size={18} className="text-maroon" />
        <h3 className="font-display text-lg text-teal-deep">Quick Calculator</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-3 flex items-center justify-between font-body text-sm text-ink-muted">
            <span>Monthly Installment</span>
            <span className="font-semibold text-teal-deep">₹{monthly.toLocaleString('en-IN')}</span>
          </label>
          <input type="range" min={scheme.minMonthlyInstallment} max={50000} step={500} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none bg-teal-subtle accent-maroon cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-maroon [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
          <div className="mt-1 flex justify-between font-body text-xs text-ink-muted/70">
            <span>₹{scheme.minMonthlyInstallment.toLocaleString('en-IN')}</span>
            <span>₹50,000</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-teal-subtle bg-ivory-light p-4 text-center">
            <p className="font-body text-xs text-ink-muted">Total Saved</p>
            <p className="mt-1 font-display text-lg text-teal-deep">₹{totalSaved.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl border border-maroon/20 bg-maroon/10 p-4 text-center">
            <p className="font-body text-xs text-maroon/70">Bonus Gold</p>
            <p className="mt-1 font-display text-lg text-maroon">+₹{bonusAmount.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl border border-teal-subtle bg-ivory-light p-4 text-center">
            <p className="font-body text-xs text-ink-muted">Total Value</p>
            <p className="mt-1 font-display text-lg text-teal-deep">₹{totalValue.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  const [showTerms, setShowTerms] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el || window.innerWidth >= 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={cardRef} className="overflow-hidden rounded-[22px] border border-teal-subtle bg-white shadow-card">
      <div className="p-6 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex-1">
            <span className="font-body text-xs font-semibold uppercase tracking-widest text-maroon">{scheme.durationMonths} Month Plan</span>
            <h3 className="mt-2 font-display text-2xl text-teal-deep md:text-3xl">{scheme.name}</h3>
            <p className="mt-2 font-body text-ink-muted">{scheme.tagline}</p>

            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-xl bg-maroon px-5 py-3 text-center">
                <span className="font-display text-3xl text-tan md:text-4xl">{scheme.bonusPercentage}%</span>
                <p className="mt-0.5 font-body text-xs text-ivory/70">Bonus</p>
              </div>
              <div>
                <p className="font-body text-sm text-ink-muted">Min. Monthly</p>
                <p className="font-display text-xl text-teal-deep">₹{scheme.minMonthlyInstallment.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <SchemeCalculator scheme={scheme} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 flex items-center gap-2 font-body text-sm font-semibold text-teal-deep">
              <CheckCircle size={14} className="text-maroon" /> Benefits
            </h4>
            <ul className="space-y-2">
              {scheme.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 font-body text-sm text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-maroon" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <button onClick={() => setShowTerms(!showTerms)} className="mb-3 flex items-center gap-2 font-body text-sm font-semibold text-teal-deep transition-colors hover:text-maroon">
              <Info size={14} className="text-maroon" /> Terms & Conditions
              <ChevronDown size={14} className={`transition-transform ${showTerms ? 'rotate-180' : ''}`} />
            </button>
            {showTerms && (
              <ul className="space-y-2">
                {scheme.terms.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-ink-muted">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-maroon/40" />
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 border-t border-teal-subtle pt-6 sm:flex-row">
          <a href={whatsappLink(`Hi! I am interested in the ${scheme.name} scheme (${scheme.durationMonths} months, ${scheme.bonusPercentage}% bonus). Please share more details.`)} target="_blank" rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-maroon px-6 py-3 font-body text-sm font-medium text-ivory transition-transform hover:scale-[1.02] sm:w-auto">
            <MessageCircle size={16} /> Enquire on WhatsApp
          </a>
          <a href={whatsappLink(`Hi! I want to enroll in the ${scheme.name} scheme. Please guide me through the process.`)} target="_blank" rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-maroon/30 px-6 py-3 font-body text-sm font-medium text-maroon transition-colors hover:bg-maroon/5 sm:w-auto">
            Enroll Now <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}

function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  const schemeFaqs = [
    { id: 'sf-01', question: 'How does the bonus gold work?', answer: 'The bonus is calculated as a percentage of your total savings over the scheme period. For example, if you save ₹1,00,000 in the Shree plan (30% bonus), you receive an additional ₹30,000 worth of gold at maturity — completely free.' },
    { id: 'sf-02', question: 'Can I withdraw before the scheme matures?', answer: 'Yes, partial withdrawals are allowed with reduced bonus. For Mangala, you can withdraw after 12 months with a 15% bonus. For Shree, partial closure is allowed after 24 months with a 20% bonus. Early withdrawals in Suvarna Sanchay forfeit the bonus.' },
    { id: 'sf-03', question: 'What happens if I miss a payment?', answer: 'Each scheme has a grace period. Suvarna Sanchay allows 2 missed installments, Mangala allows 3, and Shree provides a 7-day grace period each month with up to 5 missed installments allowed across the term. Beyond these limits, the bonus is forfeited.' },
    { id: 'sf-04', question: 'Can I take delivery as jewellery instead of coins?', answer: 'Absolutely. With the Shree plan, you have the flexibility to take your gold as jewellery, coins, or bars — or a combination. This is one of the key advantages: your savings directly translate into the jewellery you love.' },
  ]

  return (
    <div className="mt-16">
      <div className="text-center">
        <span className="font-body text-[14px] tracking-[0.05em] text-teal-deep">Questions</span>
        <h2 className="mt-1.5 font-display text-[30px] md:text-[32px] text-ink">Scheme FAQ</h2>
        <p className="mx-auto mt-3 max-w-xl font-body text-[15px] text-ink">Common questions about our gold savings plans.</p>
      </div>
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {schemeFaqs.map((faq) => (
          <div key={faq.id} className="overflow-hidden rounded-xl border border-teal-subtle bg-ivory-light">
            <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="flex w-full items-center justify-between px-5 py-4 text-left md:px-6">
              <span className="pr-4 font-body text-sm font-medium text-teal-dark md:text-base">{faq.question}</span>
              <ChevronDown size={18} className={`shrink-0 text-accent-gold transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t border-teal-subtle px-5 pt-4 pb-4 font-body text-sm leading-relaxed text-teal-dark/70 md:px-6">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SchemesPage() {
  const schemes = useSchemes()
  return (
    <div className="min-h-screen bg-ivory pt-24">
      <section className="bg-maroon py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easing }} className="max-w-3xl">
            <span className="font-body text-[15px] tracking-[0.08em] text-tan">Savings Schemes</span>
            <h1 className="mt-4 font-display text-[44px] md:text-[56px] leading-[1.1] text-ivory">
              Save in Gold, <span className="text-tan">Earn Bonus</span>
            </h1>
            <p className="mt-6 max-w-2xl font-body text-[17px] leading-[1.6] text-ivory">
              Our gold savings schemes are designed to help you build wealth the traditional Odia way — through
              consistent saving and the reward of bonus gold. Choose a plan that fits your goals and start your
              journey towards owning beautiful, hallmarked gold.
            </p>
          </motion.div>

          <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-3">
            {schemes.map((s) => (
              <div key={s.id} className="rounded-[16px] border border-ivory/15 bg-white p-4 text-center">
                <PiggyBank size={20} className="mx-auto text-maroon" />
                <p className="mt-2 font-display text-lg text-teal-deep">{s.name}</p>
                <p className="font-body text-xs text-ink-muted">{s.durationMonths} months · {s.bonusPercentage}% bonus</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mt-12 space-y-8 md:mt-16">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>

        <FAQSection />

        <div className="mt-16 rounded-[22px] bg-maroon p-8 text-center md:p-12">
          <h2 className="font-display text-2xl text-ivory md:text-3xl">Ready to Start Saving?</h2>
          <p className="mx-auto mt-3 max-w-lg font-body text-ivory/70">Talk to our team on WhatsApp and we will help you choose the perfect plan and get enrolled in minutes.</p>
          <a href={whatsappLink('Hi! I want to learn more about your gold savings schemes. Please guide me.')} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-tan px-8 py-3 font-body text-[15px] font-medium text-teal-deep transition-transform hover:scale-[1.02]">
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}