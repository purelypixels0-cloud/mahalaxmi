import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const milestones = [
  { year: '1986', label: 'Founding', desc: 'Shri Gopinath Mohapatra establishes Mahalaxmi Jewellery in a small workshop in Balasore with three karigars, laying the foundation for four decades of trust.' },
  { year: '1996', label: 'Store Extension', desc: 'Opened our first dedicated showroom on Balasore Main Road, growing to a team of 15 artisans. Families from neighbouring districts begin their journey with us.' },
  { year: '2006', label: 'Diamond Launch', desc: 'Introduced diamond jewellery to our repertoire, combining traditional Odia craftsmanship with the brilliance of ethically sourced diamonds.' },
  { year: '2026', label: 'New Showroom Launch', desc: 'Inaugurated a landmark new showroom — our largest yet — designed to offer an immersive jewellery experience across three generations of heritage.' },
]

export default function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const beamRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    let cancelled = false
    const ctx = gsap.context(() => {}, el)

    const init = () => {
      if (cancelled) return
      const pin = pinRef.current
      const stage = stageRef.current
      const track = trackRef.current
      const beam = beamRef.current
      if (!pin || !stage || !track) return

      const mm = gsap.matchMedia()

      mm.add('(min-width: 900px)', () => {
        // Center the first milestone at pin start and every subsequent one
        // at equal thirds of the scroll, so each year lands dead-centre.
        const card = track.querySelector<HTMLElement>('.milestone-card')
        const cardW = card?.offsetWidth || 280
        const pad = Math.max((stage.offsetWidth - cardW) / 2, 40)
        track.style.paddingLeft = pad + 'px'
        track.style.paddingRight = pad + 'px'
        const distance = () => track.scrollWidth - stage.offsetWidth

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => '+=' + distance(),
            scrub: true,
            pin: true,
            pinType: 'transform',
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.to(track, { x: () => -distance(), ease: 'none' }, 0)
        if (beam) tl.to(beam, { width: () => distance(), ease: 'none' }, 0)

        requestAnimationFrame(() => ScrollTrigger.refresh())
      })
    }

    // Gate GSAP setup until the page-transition wrapper (0.3s fade+slide) has
    // finished — a pinned ScrollTrigger inside a transformed ancestor misbehaves.
    const t = window.setTimeout(() => {
      requestAnimationFrame(() => {
        document.fonts.ready.then(() => {
          if (!cancelled) init()
        })
      })
    }, 450)

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('resize', refresh)
    document.fonts?.addEventListener('loadingdone', refresh)

    return () => {
      cancelled = true
      window.clearTimeout(t)
      window.removeEventListener('resize', refresh)
      document.fonts?.removeEventListener('loadingdone', refresh)
      ctx.revert()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-maroon overflow-hidden">
      {/* ── desktop: pinned horizontal scrub (≥900px) ── */}
      <div ref={pinRef} className="hidden min-[900px]:block relative h-screen w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 pt-24 md:pt-28 text-center">
          <h2 className="font-display text-[56px] md:text-[76px] text-cream">Our Journey</h2>
        </div>

        <div ref={stageRef} className="absolute inset-0 flex items-center overflow-hidden">
          <div ref={trackRef} className="relative flex w-max items-center gap-[400px] md:gap-[440px]">
            <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-white/12" />

            {milestones.map((m) => (
              <div key={m.year} className="milestone-card relative h-[420px] w-[360px] flex-none">
                <div className="absolute left-1/2 top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ivory border-[3px] border-maroon" />
                <div className="absolute inset-x-0 top-1/2 flex flex-col items-center pt-10">
                  <span className="font-display text-[68px] md:text-[76px] leading-none text-ivory">{m.year}</span>
                  <span className="mt-3 font-body text-[20px] md:text-[22px] font-medium tracking-[0.02em] text-ivory">{m.label}</span>
                  <p className="mt-4 max-w-[360px] font-body text-[17px] md:text-[18px] leading-[1.65] text-white/85 text-center">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* travelling light: head fixed at the viewport centre, beam trails left */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div
              ref={beamRef}
              className="absolute right-0 top-1/2 h-[3px] -translate-y-1/2"
              style={{
                width: 0,
                background: 'linear-gradient(to left, rgba(212,168,83,0.95), rgba(212,168,83,0.4) 55%, transparent)',
              }}
            />
            <div
              className="absolute right-0 top-1/2 h-[20px] w-[3px] -translate-y-1/2 rounded-full bg-[#D4A853]"
              style={{ boxShadow: '0 0 20px 6px rgba(212,168,83,0.8)' }}
            />
          </div>
        </div>
      </div>

      {/* ── mobile: vertical fallback (<900px) ── */}
      <div className="min-[900px]:hidden pt-20 pb-24 px-6">
        <h2 className="mb-12 text-center font-display text-[30px] sm:text-[36px] text-cream">Our Journey</h2>
        <div className="relative ml-4">
          <div className="absolute left-[7px] top-0 bottom-0 w-0.5 bg-white/12 rounded-full" />
          <div className="space-y-12">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                className="tm-milestone relative flex items-start gap-5 pl-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="absolute left-0 top-1 z-10 h-[15px] w-[15px] -translate-x-1/2 rounded-full bg-ivory border-[3px] border-maroon" />
                <div className="flex-1">
                  <span className="font-display text-3xl text-ivory">{m.year}</span>
                  <span className="mt-0.5 block font-body text-xs tracking-wider text-ivory/60 uppercase">{m.label}</span>
                  <p className="mt-2 font-body text-sm leading-relaxed text-white/85">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
