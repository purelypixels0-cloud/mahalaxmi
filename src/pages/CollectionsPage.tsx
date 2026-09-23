import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'
import collectionsData from '../data/collections.json'

gsap.registerPlugin(ScrollTrigger)

interface Collection { id: string; name: string; slug: string; description: string; story: string; image: string; pieces: number }

interface DbCollection { id: string; name: string; slug: string; description: string; story: string; image_url: string; pieces: number }

const collectionsFallback = collectionsData as Collection[]

function CollectionsHero() {
  return (
    <section className="bg-ivory pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easing }} className="max-w-3xl">
          <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Collections</span>
          <h1 className="mt-4 font-display text-[44px] md:text-[56px] leading-[1.1] text-maroon">
            Signature Collections
          </h1>
          <p className="mt-6 max-w-2xl font-body text-[17px] leading-[1.6] text-ink">
            Each collection is a tribute to Odisha&rsquo;s craftsmanship — from the 500-year-old silver filigree of
            Tarakasi to complete bridal ensembles crafted for generations. Explore the stories behind every piece.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function CollectionsGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const live = useCmsTable<DbCollection[]>('collections', [])
  const collections: Collection[] = live.live && live.data.length > 0
    ? live.data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', story: c.story ?? '', image: c.image_url ?? '', pieces: c.pieces ?? 0 }))
    : collectionsFallback

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.collection-card'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {collections.map((c) => (
            <Link
              key={c.id}
              to={`/collections/${c.slug}`}
              className="collection-card group flex flex-col overflow-hidden rounded-[22px] bg-white border border-teal-subtle transition-colors duration-300 hover:border-maroon hover:bg-maroon hover:shadow-card active:border-maroon active:bg-maroon active:shadow-card"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-ivory-light transition-colors duration-300 group-hover:bg-white/10 group-active:bg-white/10">
                {c.image ? (
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-[22px] md:text-[24px] leading-snug text-maroon transition-colors duration-300 group-hover:text-cream group-active:text-cream">{c.name}</h2>
                <p className="mt-2 font-body text-[14px] leading-[1.5] text-ink-muted line-clamp-2 transition-colors duration-300 group-hover:text-ivory/80 group-active:text-ivory/80">{c.description}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="font-body text-xs text-ink-muted/80 transition-colors duration-300 group-hover:text-ivory/60 group-active:text-ivory/60">{c.pieces} pieces</span>
                  <span className="inline-flex items-center gap-1 font-body text-[14px] font-medium text-maroon transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-tan group-active:translate-x-0.5 group-active:text-tan">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="mx-auto max-w-xl font-body text-[15px] leading-relaxed text-ink">
            See our collections in person — visit our showroom in Balasore or book a private viewing.
          </p>
          <Link to="/book-appointment" className="mt-6 inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 font-body text-[15px] font-medium text-ivory transition-transform hover:scale-[1.02]">
            Book an Appointment <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function CollectionsPage() {
  return (
    <>
      <CollectionsHero />
      <CollectionsGrid />
    </>
  )
}