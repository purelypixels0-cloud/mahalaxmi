import { useRef, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  ChevronLeft, ChevronRight, Star,
  Phone, MapPin, ChevronDown, ArrowLeft, ArrowRight, CheckCircle, ExternalLink, Image,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeader from '../components/common/SectionHeader'
import TimelineSection from '../components/common/TimelineSection'
import FlipButton from '../components/common/FlipButton'
import { easing } from '../router/AppRouter'
import { useCmsKV, useCmsTable } from '../lib/content'
import schemesData from '../data/schemes.json'
import faqsData from '../data/faqs.json'
import blogsData from '../data/blogs.json'
import categoriesData from '../data/categories.json'
import collectionsData from '../data/collections.json'
import { whatsappLink, WHATSAPP_NUMBER } from '../config/contact'

gsap.registerPlugin(ScrollTrigger)

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string
  category: string; author: string; readTime: string; publishDate: string; image: string
}
interface Scheme {
  id: string; name: string; tagline: string; durationMonths: number
  bonusPercentage: number; minMonthlyInstallment: number; benefits: string[]; terms: string[]
}
interface FAQ { id: string; question: string; answer: string }
interface Category { id: string; name: string; slug: string; description: string; image: string; featured?: boolean }
interface Collection { id: string; name: string; slug: string; description: string; story: string; image: string; pieces: number }
interface JournalEntry { id: string; number: string; category: string; title: string; preview: string; href: string; imagePath: string }

interface DbCategory { id: string; name: string; slug: string; description: string; image_url: string; featured?: boolean }
interface DbCollection { id: string; name: string; slug: string; description: string; story: string; image_url: string; pieces: number }
interface DbScheme {
  id: string; name: string; tagline: string; duration_months: number; bonus_percentage: number
  min_installment: number; benefits: string[]; terms: string[]; sort_order: number
}
interface DbPost {
  id: string; title: string; slug: string; excerpt: string; content: string
  category: string; author: string; read_time: string; publish_date: string | null
  image_url: string; published: boolean
}
interface DbFaq { id: string; section: string; question: string; answer: string }
interface DbTestimonial { id: string; name: string; location: string; text: string; rating: number }

const blogsFallback = blogsData as BlogPost[]
const schemesFallback = schemesData as Scheme[]
const faqsFallback = faqsData as FAQ[]
const categoriesFallback = categoriesData as Category[]
const collectionsFallback = collectionsData as Collection[]

function useLiveCategories(): Category[] {
  const live = useCmsTable<DbCategory[]>('categories', [])
  if (live.live && live.data.length > 0) {
    return live.data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', image: c.image_url ?? '', featured: c.featured }))
  }
  return categoriesFallback
}

function useLiveCollections(): Collection[] {
  const live = useCmsTable<DbCollection[]>('collections', [])
  if (live.live && live.data.length > 0) {
    return live.data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', story: c.story ?? '', image: c.image_url ?? '', pieces: c.pieces ?? 0 }))
  }
  return collectionsFallback
}

function useLiveSchemes(): Scheme[] {
  const live = useCmsTable<DbScheme[]>('schemes', [])
  if (live.live && live.data.length > 0) {
    return live.data.map((s) => ({
      id: s.id, name: s.name, tagline: s.tagline ?? '',
      durationMonths: s.duration_months ?? 12, bonusPercentage: Number(s.bonus_percentage) || 0,
      minMonthlyInstallment: Number(s.min_installment) || 0,
      benefits: Array.isArray(s.benefits) ? s.benefits : [], terms: Array.isArray(s.terms) ? s.terms : [],
    }))
  }
  return schemesFallback
}

function useLiveBlogs(): BlogPost[] {
  const live = useCmsTable<DbPost[]>('posts', [])
  if (live.live && live.data.length > 0) {
    return live.data
      .filter((p) => p.published !== false)
      .map((b) => ({
        id: b.id, title: b.title, slug: b.slug, excerpt: b.excerpt ?? '', content: b.content ?? '',
        category: b.category ?? '', author: b.author ?? '', readTime: b.read_time ?? '',
        publishDate: b.publish_date ?? '', image: b.image_url ?? '',
      }))
  }
  return blogsFallback
}

function useLiveFaqs(): FAQ[] {
  const live = useCmsTable<DbFaq[]>('faqs', [])
  if (live.live && live.data.length > 0) {
    return live.data.filter((f) => (f.section ?? 'home') === 'home').map((f) => ({ id: f.id, question: f.question, answer: f.answer ?? '' }))
  }
  return faqsFallback
}

function useLiveTestimonials() {
  const live = useCmsTable<DbTestimonial[]>('testimonials', [])
  if (live.live && live.data.length > 0) {
    return live.data.map((t) => ({ name: t.name, location: t.location ?? '', text: t.text ?? '', rating: t.rating ?? 5 }))
  }
  return testimonialsFallback
}

function useLiveJournalEntries(): JournalEntry[] {
  return useLiveBlogs().slice(0, 3).map((b, i) => ({
    id: b.id,
    number: String(i + 1).padStart(2, '0'),
    category: b.category,
    title: b.title,
    preview: b.excerpt,
    href: `/journal/${b.slug}`,
    imagePath: b.image,
  }))
}

const journalItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 55, damping: 24 } },
}

const journalStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const statData = [
  { target: 40, suffix: '+', decimals: 0, label: 'Years of Legacy' },
  { target: 10, suffix: 'K+', decimals: 0, label: 'Happy Families' },
  { target: 100, suffix: '%', decimals: 0, label: 'Hallmarked Gold' },
  { target: 4.9, suffix: '', decimals: 1, label: 'Customer Rating' },
]

const whyUsCards = [
  { title: '100% Hallmarked', desc: 'Every piece BIS hallmarked for guaranteed purity and your complete peace of mind.', featured: false },
  { title: '40 Years of Trust', desc: 'Four decades of honest dealing — trusted by over 10,000 families in Odisha and beyond.', featured: false },
  { title: 'WhatsApp Connect', desc: 'Browse, enquire, and order directly through WhatsApp. Personalised service at your fingertips.', featured: true },
  { title: 'Custom Designs', desc: 'Bring your vision to life. Our master karigars create bespoke pieces tailored to your style.', featured: false },
]

const testimonialsFallback = [
  { name: 'Sneha Patnaik', location: 'Balasore', text: 'I bought my bridal set from Mahalaxmi and the craftsmanship is simply breathtaking. The Tarakasi work is so delicate — I receive compliments every time I wear it.', rating: 5 },
  { name: 'Ravi Mohanty', location: 'Bhubaneswar', text: 'We have been customers for three generations. The quality is consistent, the prices are fair, and the gold purity is always guaranteed.', rating: 5 },
  { name: 'Priya Das', location: 'Cuttack', text: 'The savings scheme helped me accumulate gold for my daughter\'s wedding without feeling the financial strain. We received a beautiful bonus too!', rating: 5 },
  { name: 'Arun Mishra', location: 'Kolkata', text: 'Even though I live in Kolkata, I travel to Balasore for all my jewellery needs. The custom design service is exceptional — they created a unique piece for my wife.', rating: 4 },
  { name: 'Laxmi Behera', location: 'Balasore', text: 'The staff explained every detail about hallmarking and making charges. For the first time, I felt completely confident about my jewellery purchase.', rating: 5 },
]

function HeroSection() {
  const hero = useCmsKV('homepage_content', 'hero', {
    eyebrow: 'Rooted in Odisha • Since 1986',
    title: 'Jewellery That Understands Your Traditions.',
    sub1: 'Not every ornament becomes an heirloom.',
    sub2: 'We create jewellery inspired by Odisha’s rich traditions, crafted to celebrate every milestone for generations to come.',
  })
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url(/hero-bg.png)] bg-cover bg-center object-cover" />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-36 md:py-48">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <span className="font-body text-base tracking-[0.02em] text-ink">{hero.data.eyebrow}</span>

          <h1 className="font-display text-[38px] sm:text-[50px] md:text-[76px] leading-[1.1] md:leading-[1.05] text-maroon max-w-[600px] mt-4 mb-6">
            {hero.data.title}
          </h1>

          <div className="max-w-[400px]">
            <p className="font-body text-[17px] leading-[1.6] text-ink">{hero.data.sub1}</p>
            <p className="font-body text-[17px] leading-[1.6] text-ink mt-3">{hero.data.sub2}</p>
          </div>

          <div className="mt-10">
            <FlipButton to="/catalogue" variant="pantone" size="lg">
              Explore Collection <ArrowRight size={18} strokeWidth={2} />
            </FlipButton>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StatNumber({ stat, start }: { stat: (typeof statData)[number]; start: boolean }) {
  const [display, setDisplay] = useState(stat.decimals ? stat.target.toFixed(stat.decimals) : String(stat.target))

  useEffect(() => {
    if (!start) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(stat.decimals ? stat.target.toFixed(stat.decimals) : String(stat.target))
      return
    }
    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: stat.target,
      duration: 1.8,
      ease: 'power2.out',
      onUpdate: () => setDisplay(obj.val.toFixed(stat.decimals)),
      onComplete: () => setDisplay(stat.decimals ? stat.target.toFixed(stat.decimals) : String(stat.target)),
    })
    return () => { tween.kill() }
  }, [start, stat])

  return <>{display}{stat.suffix}</>
}

function StatsBar() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => setStarted(true),
      })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12 md:gap-12">
          {statData.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-[48px] md:text-[72px] lg:text-[80px] text-maroon leading-none">
                <StatNumber stat={s} start={started} />
              </p>
              <p className="mt-2 font-body text-[15px] text-maroon">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AboutPreview() {
  const about = useCmsKV('homepage_content', 'about', {
    eyebrow: 'About Us',
    title: 'Crafting Trust Since 1986',
    body: 'Founded in 1986 by Shri Gopinath Mohapatra in the heart of Balasore, Mahalaxmi Jewellery began as a small workshop with three karigars and a singular vision — to make heirloom-quality jewellery accessible to every Odia family. What started as a family craft has grown into one of Odisha\u2019s most trusted jewellery destinations. Today, three generations later, our commitment remains unchanged. Every piece that leaves our atelier carries the legacy of Odisha\u2019s rich craftsmanship — from the delicate silver filigree of Tarakasi to the timeless elegance of Temple jewellery. We don\u2019t just sell jewellery; we preserve traditions, celebrate milestones, and build relationships that span generations.',
  })
  return (
    <section className="bg-ivory-light py-16 md:py-24">
      <div className="mx-auto max-w-[900px] px-6">
        <div className="text-center">
          <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">{about.data.eyebrow}</span>
          <h2 className="mt-2 font-display text-[30px] sm:text-[36px] md:text-[48px] leading-tight text-maroon">{about.data.title}</h2>
          <p className="mx-auto mt-7 max-w-[880px] font-body text-[16px] md:text-[17px] leading-[1.7] text-ink">
            {about.data.body}
          </p>
        </div>
      </div>
    </section>
  )
}

function Timeline() {
  return <TimelineSection />
}

const CAROUSEL_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const CAROUSEL_DUR = 0.6

function CollectionCardFace({ highlight, pressed, c }: { highlight: boolean; pressed?: boolean; c: Collection }) {
  const active = highlight || pressed
  return (
    <div className={`flex h-full w-full flex-col p-5 md:p-6 rounded-[24px] ${active ? 'bg-maroon shadow-[0_24px_60px_-16px_rgba(72,24,50,0.45)]' : 'bg-white border border-black/5 shadow-[0_16px_40px_-20px_rgba(7,39,45,0.25)]'}`}>
      <div className={`flex-1 overflow-hidden rounded-2xl border-2 border-dashed ${active ? 'border-white/20 bg-white/5' : 'border-black/10 bg-black/5'}`}>
        {c.image ? (
          <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <h3 className={`mt-4 text-center font-display text-[24px] md:text-[28px] ${active ? 'text-cream' : 'text-ink'}`}>{c.name}</h3>
    </div>
  )
}

function CarouselCard({ c, rel, itemW, onNavigate }: { c: Collection; rel: number; itemW: number; onNavigate: () => void }) {
  const [pressed, setPressed] = useState(false)
  const center = rel === 0
  return (
    <div
      className="h-full shrink-0 cursor-pointer"
      style={{ width: itemW }}
      onClick={onNavigate}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
    >
      <motion.div
        className="h-full"
        animate={{ scale: center ? 1 : 0.93, opacity: center ? 1 : 0.72 }}
        transition={{ duration: CAROUSEL_DUR, ease: CAROUSEL_EASE }}
      >
        <CollectionCardFace highlight={center} pressed={pressed} c={c} />
      </motion.div>
    </div>
  )
}

function CollectionsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [layout, setLayout] = useState({ itemW: 320, rowH: 427, step: 352, viewportW: 320, gap: 32 })
  const touchStart = useRef<number | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const collections = useLiveCollections()

  const n = collections.length

  useEffect(() => {
    const measure = () => {
      const mobile = window.innerWidth < 768
      const vpW = Math.round(viewportRef.current?.getBoundingClientRect().width ?? window.innerWidth)
      const gap = mobile ? 24 : 32
      const itemW = mobile ? Math.min(vpW * 0.8, 330) : (vpW - gap * 2) / 3
      setLayout({ itemW, rowH: itemW * (4 / 3), step: itemW + gap, viewportW: vpW, gap })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const goTo = (dir: 1 | -1) => setActiveIndex((i) => (i + dir + n) % n)

  const relOf = (i: number, base: number) => {
    const d = (((i - base) % n) + n) % n
    return d > n / 2 ? d - n : d
  }

  const trackX = layout.viewportW / 2 - layout.itemW / 2 - activeIndex * layout.step

  return (
    <section className="bg-ivory py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1150px] px-4 sm:px-6">
        <p className="text-center font-body text-[16px] tracking-[0.05em] text-teal-deep">Signature Collections</p>
        <h2 className="mt-2 text-center font-display text-[30px] sm:text-[36px] md:text-[48px] text-teal-deep">Crafted for Every Celebration</h2>

        <div className="relative mt-14 md:mt-20">
          <button
            onClick={() => goTo(-1)}
            aria-label="Previous collection"
            className="hidden md:flex absolute -left-[38px] top-1/2 -translate-y-1/2 z-20 h-[72px] w-[72px] items-center justify-center rounded-full bg-teal-deep text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={26} strokeWidth={2} />
          </button>
          <button
            onClick={() => goTo(1)}
            aria-label="Next collection"
            className="hidden md:flex absolute -right-[38px] top-1/2 -translate-y-1/2 z-20 h-[72px] w-[72px] items-center justify-center rounded-full bg-teal-deep text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowRight size={26} strokeWidth={2} />
          </button>

          <div
            ref={viewportRef}
            className="overflow-hidden touch-pan-y select-none"
            style={{ height: layout.rowH }}
            onTouchStart={(e) => { touchStart.current = e.touches[0].clientX }}
            onTouchEnd={(e) => {
              if (touchStart.current === null) return
              const delta = e.changedTouches[0].clientX - touchStart.current
              touchStart.current = null
              if (delta > 45) goTo(-1)
              else if (delta < -45) goTo(1)
            }}
          >
            <motion.div
              className="flex h-full"
              style={{ gap: layout.gap }}
              animate={{ x: trackX }}
              transition={{ duration: CAROUSEL_DUR, ease: CAROUSEL_EASE }}
            >
              {collections.map((c, i) => {
                const rel = relOf(i, activeIndex)
                return (
                  <CarouselCard
                    key={c.id}
                    c={c}
                    rel={rel}
                    itemW={layout.itemW}
                    onNavigate={() => {
                      if (rel === 0) navigate(`/collections/${c.slug}`)
                      else if (rel === -1) goTo(-1)
                      else if (rel === 1) goTo(1)
                    }}
                  />
                )
              })}
            </motion.div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4 md:hidden">
            <button
              onClick={() => goTo(-1)}
              aria-label="Previous collection"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-deep text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            <button
              onClick={() => goTo(1)}
              aria-label="Next collection"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-deep text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <ArrowRight size={22} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

const catCardBg = {
  rest: { backgroundColor: '#F5F5DD', transition: { duration: 0.28, ease: 'easeOut' as const } },
  hover: { backgroundColor: '#481832', transition: { duration: 0.28, ease: 'easeOut' as const } },
}

const catCardText = {
  rest: { color: '#0A0A0A', transition: { duration: 0.28, ease: 'easeOut' as const } },
  hover: { color: '#FFFFFF', transition: { duration: 0.28, ease: 'easeOut' as const } },
}

function SmallCategoryCard({ c }: { c: Category }) {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const state = hover || pressed ? 'hover' : 'rest'
  return (
    <Link to={`/catalogue?category=${c.slug}`} className="block cursor-pointer">
      <motion.div
        variants={catCardBg}
        initial="rest"
        animate={state}
        onHoverStart={() => setHover(true)}
        onHoverEnd={() => setHover(false)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onPointerCancel={() => setPressed(false)}
        className="flex w-full overflow-hidden rounded-[20px]"
      >
        <div className="w-[35%] flex-shrink-0 overflow-hidden">
          {c.image ? (
            <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col items-start justify-center gap-1.5 px-5 py-5">
          <motion.h3 initial="rest" animate={state} variants={catCardText} className="font-display text-[22px] md:text-[24px] text-ink">{c.name}</motion.h3>
          <motion.p initial="rest" animate={state} variants={catCardText} className="font-body text-[14px] leading-[1.4] text-ink line-clamp-2">{c.description}</motion.p>
        </div>
      </motion.div>
    </Link>
  )
}

function FeaturedCategoryCard({ c }: { c: Category }) {
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)
  const state = hover || pressed ? 'hover' : 'rest'
  return (
    <Link to={`/catalogue?category=${c.slug}`} className="block cursor-pointer">
      <div className="flex w-full flex-col overflow-hidden rounded-[24px] bg-ivory">
        <div className="aspect-[6/5] w-full overflow-hidden">
          {c.image ? (
            <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <motion.div
          variants={catCardBg}
          initial="rest"
          animate={state}
          onHoverStart={() => setHover(true)}
          onHoverEnd={() => setHover(false)}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          className="flex flex-1 flex-col justify-center gap-1.5 px-6 py-8"
        >
          <motion.h3 initial="rest" animate={state} variants={catCardText} className="font-display text-[28px] md:text-[32px] text-ink">{c.name}</motion.h3>
          <motion.p initial="rest" animate={state} variants={catCardText} className="font-body text-[15px] leading-[1.5] text-ink">{c.description}</motion.p>
        </motion.div>
      </div>
    </Link>
  )
}

function CategoriesSection() {
  const categories = useLiveCategories()
  const featuredCats = categories.filter((c) => c.featured)
  const smallCats = categories.filter((c) => !c.featured)
  const leftCol = [featuredCats[0], ...smallCats.slice(3)]
  const rightCol = [...smallCats.slice(0, 3), featuredCats[1]]

  return (
    <section className="bg-teal-deep py-16 md:py-24">
      <div className="mx-auto max-w-[1150px] px-4 sm:px-6">
        <p className="text-center font-body text-[15px] tracking-[0.05em] text-ivory">Categories</p>
        <h2 className="mt-1.5 text-center font-display text-[32px] md:text-[36px] text-ivory">Discover Timeless Elegance</h2>

        <div className="mt-12 flex flex-col gap-4 md:hidden">
          {categories.map((c) => (c.featured ? <FeaturedCategoryCard key={c.id} c={c} /> : <SmallCategoryCard key={c.id} c={c} />))}
        </div>

        <div className="mt-12 hidden gap-5 md:flex">
          <div className="flex w-1/2 flex-col gap-4">
            {leftCol.map((c) => (c.featured ? <FeaturedCategoryCard key={c.id} c={c} /> : <SmallCategoryCard key={c.id} c={c} />))}
          </div>
          <div className="flex w-1/2 flex-col gap-4">
            {rightCol.map((c) => (c.featured ? <FeaturedCategoryCard key={c.id} c={c} /> : <SmallCategoryCard key={c.id} c={c} />))}
          </div>
        </div>
      </div>
    </section>
  )
}

function WhyUsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelector('.why-grid'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center font-body text-[14px] tracking-[0.05em] text-teal-deep">Advantages</p>
        <h2 className="mt-1.5 text-center font-display text-[30px] md:text-[32px] text-teal-deep">Why Mahalaxmi</h2>
        <div className="why-grid mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 items-start">
          {whyUsCards.map(({ title, desc, featured }) =>
            featured ? (
              <div key={title} className="flex flex-col items-center rounded-[20px] bg-maroon p-6 text-center">
                <h3 className="font-display text-[26px] md:text-[28px] leading-[1.15] text-ivory">{title}</h3>
                <p className="mt-2 font-body text-[14px] md:text-[15px] leading-[1.5] text-ivory">{desc}</p>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-tan px-6 py-2.5 font-body text-[15px] font-medium text-maroon transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Enquire Now
                </a>
              </div>
            ) : (
              <div key={title} className="flex flex-col items-center rounded-[20px] bg-white p-6 text-center">
                <h3 className="font-display text-[26px] md:text-[28px] leading-[1.15] text-ink">{title}</h3>
                <p className="mt-2 font-body text-[14px] md:text-[15px] leading-[1.5] text-ink">{desc}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}

function SchemesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const topSchemes = useLiveSchemes().slice(0, 3)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.scheme-card'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[radial-gradient(ellipse_at_top,#ffffff,#f2f2f2)] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center font-body text-[14px] tracking-[0.05em] text-teal-deep">Investments</p>
        <h2 className="mt-1.5 text-center font-display text-[30px] md:text-[32px] text-ink">Gold Savings Schemes</h2>
        <div className="mt-10 md:mt-12 grid md:grid-cols-3 gap-6 md:gap-8">
          {topSchemes.map((s) => (
            <div key={s.id} className="scheme-card rounded-2xl bg-maroon p-6 md:p-8 flex flex-col shadow-card">
              <span className="text-tan text-sm font-semibold">{s.durationMonths} Months</span>
              <h3 className="mt-2 text-xl md:text-2xl font-display text-ivory">{s.name}</h3>
              <p className="mt-2 text-sm text-ivory/60 font-body leading-relaxed">{s.tagline}</p>
              <div className="mt-5 text-center">
                <span className="text-4xl md:text-5xl font-display text-tan">{s.bonusPercentage}%</span>
                <p className="text-xs text-tan mt-1">Bonus on maturity</p>
              </div>
              <p className="mt-2 text-center text-sm text-ivory font-body">Starting with ₹{s.minMonthlyInstallment.toLocaleString('en-IN')}/month</p>
              <div className="mt-auto pt-6 space-y-2">
                <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I want to know more about the ${s.name} scheme.`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full py-2.5 rounded-full bg-tan text-maroon text-sm font-medium hover:bg-tan/90 transition-colors">
                  Enquire on WhatsApp
                </a>
                <Link to="/schemes" className="flex items-center justify-center w-full py-2.5 rounded-full border border-ivory text-ivory text-sm font-medium hover:bg-ivory/10 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const testimonials = useLiveTestimonials()
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLDivElement>(null)
  const safeActive = testimonials.length ? active % testimonials.length : 0

  const next = () => setActive((a) => (a + 1) % testimonials.length)
  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.testimonial-reveal'), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <SectionHeader title="What Our Customers Say" />
        <div className="testimonial-reveal relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div key={safeActive} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: easing }} className="text-center">
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: testimonials[safeActive].rating }).map((_, i) => (
                  <Star key={i} size={18} className="fill-accent-gold text-accent-gold" />
                ))}
              </div>
              <p className="text-lg md:text-xl text-teal-dark/80 font-body leading-relaxed italic">&ldquo;{testimonials[safeActive].text}&rdquo;</p>
              <p className="mt-6 font-display text-teal-dark">{testimonials[safeActive].name}</p>
              <p className="text-sm text-teal-dark/50">{testimonials[safeActive].location}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center items-center gap-4 mt-10">
            <button onClick={prev} className="w-10 h-10 rounded-full border border-teal-subtle flex items-center justify-center text-teal-dark/60 hover:text-teal-dark hover:border-teal-dark/30 transition-colors" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActive(i)} className={`h-3 w-3 rounded-full transition-all duration-300 ${i === active ? 'bg-maroon w-8' : 'bg-teal-subtle'}`} aria-label={`Go to testimonial ${i + 1}`} />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full border border-teal-subtle flex items-center justify-center text-teal-dark/60 hover:text-teal-dark hover:border-teal-dark/30 transition-colors" aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function JournalSection() {
  const journalEntries = useLiveJournalEntries()
  return (
    <section className="bg-teal-deep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center"
        >
          <p className="font-body text-[14px] tracking-[0.05em] text-ivory">Blogs</p>
          <h2 className="mt-1.5 font-display text-[32px] text-ivory">The Journals</h2>
        </motion.div>

        <div className="mt-10 flex flex-col gap-4 md:mt-16 md:block">
          {journalEntries.map((e, i) => {
            const isLast = i === journalEntries.length - 1
            return (
              <div key={e.id} className={isLast ? 'h-auto md:h-[60vh]' : 'h-auto md:h-[110vh]'}>
                <div
                  className="flex flex-col overflow-hidden rounded-[22px] bg-ivory md:h-[360px] md:flex-row md:gap-4 md:sticky md:top-[110px]"
                  style={{ zIndex: i + 1 }}
                >
                  <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 overflow-hidden border-2 border-dashed border-teal-deep/25 md:order-2 md:aspect-auto md:h-full md:w-[41%] md:flex-shrink-0">
                    {e.imagePath ? (
                      <img src={e.imagePath} alt={e.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <Image size={26} className="text-teal-deep/25" />
                        <span className="font-body text-[13px] tracking-[0.08em] text-teal-deep/25">IMAGE</span>
                      </>
                    )}
                  </div>
                  <motion.div
                    variants={journalStagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    className="flex flex-col p-6 md:order-1 md:w-[59%] md:p-8"
                  >
                    <motion.div variants={journalItem} className="flex items-baseline justify-between gap-4">
                      <span className="font-display text-[56px] md:text-[60px] leading-none text-maroon">{e.number}</span>
                      <span className="font-body text-[15px] font-semibold text-ink">{e.category}</span>
                    </motion.div>
                    <motion.h3 variants={journalItem} className="mt-3 font-display text-[22px] md:text-[24px] leading-[1.3] text-teal-deep line-clamp-2">{e.title}</motion.h3>
                    <motion.p variants={journalItem} className="mt-2 font-body text-[14px] leading-[1.5] text-ink-muted line-clamp-2">{e.preview}</motion.p>
                    <motion.div variants={journalItem} className="mt-auto flex justify-end pt-4">
                      <Link to={e.href} className="inline-flex items-center gap-1 py-3 -my-3 font-body text-[14px] font-medium text-maroon hover:underline">Read More →</Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/journal" className="inline-flex items-center gap-2 rounded-full bg-ivory px-7 py-3 font-body text-[15px] font-medium text-teal-deep transition-transform hover:scale-[1.02]">
            Read All Articles →
          </Link>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [openId, setOpenId] = useState<string | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const topFaqs = useLiveFaqs().slice(0, 5)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.faq-item'), { opacity: 0, y: 15 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: easing, scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader title="Frequently Asked Questions" />
        <div className="space-y-3">
          {topFaqs.map((faq) => (
            <div key={faq.id} className="faq-item rounded-xl border border-teal-subtle bg-ivory-light overflow-hidden transition-shadow duration-300 hover:shadow-warm">
              <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full flex items-center justify-between px-5 md:px-6 py-4 text-left">
                <span className="text-sm md:text-base font-medium text-teal-dark pr-4 leading-snug">{faq.question}</span>
                <ChevronDown size={18} className={`shrink-0 text-accent-gold transition-transform duration-300 ${openId === faq.id ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openId === faq.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 md:px-6 pb-4 text-sm text-teal-dark/70 font-body leading-relaxed border-t border-teal-subtle pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const appointmentBenefits = [
  'Personal 1-on-1 consultation with our design experts',
  'View and try our entire collection in a relaxed setting',
  'Get expert advice on gold purity, making charges, designs',
  'Custom design discussions — bring your ideas to life',
  'Complimentary gold valuation of your existing jewellery',
]

function AppointmentSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const categories = useLiveCategories()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.appt-reveal'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.9, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  // TODO: wire to backend/email service once available
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !phone.trim()) {
      setError('Please fill in your name and phone number.')
      return
    }
    console.log('Appointment request:', { name, phone, email, interest, message })
    setName('')
    setPhone('')
    setEmail('')
    setInterest('')
    setMessage('')
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-white border border-teal-subtle text-teal-deep text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-tan transition-colors'

  return (
    <section ref={sectionRef} className="bg-maroon py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.22fr_1fr] lg:gap-16 items-center">
          <div className="appt-reveal">
            <h2 className="font-display text-[32px] md:text-[40px] leading-tight text-tan">Book an Appointment</h2>
            <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-ivory">
              Experience our collection in person. Let us help you find the perfect piece.
            </p>
            <div className="mt-8 space-y-2.5">
              {appointmentBenefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle size={16} className="mt-0.5 shrink-0 text-ivory" />
                  <span className="font-body text-sm text-ivory">{b}</span>
                </div>
              ))}
            </div>
            <a href={whatsappLink("Hi, I'd like to book an appointment.")} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-tan px-7 py-3 font-body text-[15px] font-medium text-maroon transition-transform hover:scale-[1.02] active:scale-95">
              <MessageCircle size={17} /> WhatsApp us to book
            </a>
          </div>

          <div className="appt-reveal">
            <div className="rounded-[22px] bg-ivory p-6 shadow-elevated md:p-8">
              <h3 className="font-display text-xl md:text-2xl text-teal-deep">Request a Visit</h3>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className={inputCls} />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className={inputCls} />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className={inputCls} />
                <select value={interest} onChange={(e) => setInterest(e.target.value)} className={`${inputCls} ${interest ? '' : 'text-teal-dark/30'}`}>
                  <option value="" disabled>I am interested in...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                  <option value="Custom Design">Custom Design</option>
                  <option value="Gold Savings Scheme">Gold Savings Scheme</option>
                  <option value="Other">Other</option>
                </select>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3} className={`${inputCls} resize-none`} />
                {error && <p className="font-body text-xs text-red-400">{error}</p>}
                <button type="submit" className="w-full rounded-full bg-tan py-2.5 font-body text-sm font-medium text-teal-deep transition-colors hover:bg-tan/85">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const googleMapsUrl = 'https://www.google.com/maps?q=Balasore,+Odisha,+India'

function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.contact-reveal'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.9, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  // TODO: wire to backend/email service once available
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim() || !email.trim()) {
      setError('Please fill in your name and email.')
      return
    }
    console.log('Contact message:', { name, email, message })
    setName('')
    setEmail('')
    setMessage('')
  }

  const inputCls = 'w-full px-4 py-2.5 rounded-lg bg-white border border-teal-subtle text-teal-deep text-sm placeholder:text-teal-dark/30 focus:outline-none focus:border-tan transition-colors'

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="contact-reveal">
            <h2 className="font-display text-[32px] md:text-[40px] leading-tight text-maroon">Get in Touch</h2>
            <p className="mt-4 max-w-xl font-body text-[15px] leading-relaxed text-ink">
              Visit our showroom or reach out — we are always happy to help.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon">
                  <MapPin size={16} className="text-ivory" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-ink">Showroom</p>
                  <p className="mt-0.5 font-body text-sm text-[#969689]">Balasore, Odisha, India</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-maroon">
                  <Phone size={16} className="text-ivory" />
                </div>
                <div>
                  <p className="font-body text-sm font-semibold text-ink">Phone</p>
                  <a href="tel:+919937012345" className="mt-0.5 block w-fit py-2 -my-2 font-body text-sm text-[#969689] transition-colors hover:text-maroon">+91 9937012345</a>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 max-w-md space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" className={inputCls} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputCls} />
              </div>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3} className={`${inputCls} resize-none`} />
              {error && <p className="font-body text-xs text-red-400">{error}</p>}
              <button type="submit" className="rounded-full bg-tan px-6 py-2.5 font-body text-sm font-medium text-teal-deep transition-colors hover:bg-tan/85">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-reveal space-y-5">
            <div className="overflow-hidden rounded-[22px] shadow-card">
              <iframe
                title="Mahalaxmi Jewellery showroom location"
                src="https://www.google.com/maps?q=Balasore,+Odisha,+India&output=embed"
                className="aspect-[16/11] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 py-3 -my-3 font-body text-sm font-medium text-accent-gold transition-colors hover:text-accent-gold/80">
              <ExternalLink size={14} /> Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <AboutPreview />
      <Timeline />
      <CollectionsSection />
      <CategoriesSection />
      <WhyUsSection />
      <SchemesSection />
      <TestimonialsSection />
      <JournalSection />
      <FAQSection />
      <AppointmentSection />
      <ContactSection />
    </>
  )
}
