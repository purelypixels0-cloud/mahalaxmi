import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gem, Shield, Heart, Users, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TimelineSection from '../components/common/TimelineSection'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'

gsap.registerPlugin(ScrollTrigger)

const values = [
  { Icon: Gem, title: 'Craftsmanship', desc: 'Every piece is handcrafted by master karigars who have honed their skills over decades. We never compromise on the quality of workmanship.' },
  { Icon: Shield, title: 'Trust & Purity', desc: '100% BIS hallmarked gold, transparent pricing, and honest dealings — our reputation is built on trust that spans four decades.' },
  { Icon: Heart, title: 'Tradition', desc: 'We are not just jewellers; we are custodians of Odisha\'s rich cultural heritage. Every design tells a story rooted in our land.' },
  { Icon: Users, title: 'Family First', desc: 'From our family to yours — we treat every customer as an extension of our own family, with warmth, respect, and personalised attention.' },
]

const teamPlaceholders = [
  { name: 'Shri Gopinath Mohapatra', role: 'Founder', era: '1986' },
  { name: 'Anjali Mohapatra', role: 'Lead Designer', era: '2005' },
  { name: 'Ankit Mohapatra', role: 'Managing Director', era: '2015' },
  { name: 'Rohit Das', role: 'Master Karigar', era: '1995' },
]

function HeroSection() {
  return (
    <section className="bg-ivory pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: easing }} className="max-w-3xl">
          <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Our Story</span>
          <h1 className="mt-4 font-display text-[44px] md:text-[56px] leading-[1.1] text-maroon">
            Crafting Trust Since 1986
          </h1>
          <p className="mt-6 max-w-2xl font-body text-[17px] leading-[1.6] text-ink">
            From a modest workshop in Balasore to becoming one of Odisha&rsquo;s most trusted jewellery destinations —
            our journey has been shaped by passion, perseverance, and an unwavering commitment to quality.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

function StorySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.story-reveal'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.2, duration: 0.9, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory-light py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          <div className="story-reveal">
            <div className="flex aspect-[5/6] flex-col items-center justify-center rounded-[22px] bg-maroon p-8">
              <blockquote className="text-center">
                <p className="font-display text-2xl md:text-3xl italic leading-relaxed text-ivory">&ldquo;Jewellery is not metal and stone. It is memory made visible.&rdquo;</p>
                <p className="mt-5 font-body text-sm text-tan">— Gopinath Mohapatra, Founder</p>
              </blockquote>
            </div>
          </div>
          <div className="story-reveal">
            <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Our Heritage</span>
            <h2 className="mt-2 font-display text-[30px] md:text-[32px] leading-tight text-maroon">Four Decades of Preserving Odisha&rsquo;s Jewellery Traditions</h2>
            <div className="mt-6 space-y-5 font-body leading-relaxed text-ink">
              <p>
                Mahalaxmi Jewellery was born in 1986 from a simple belief — that every woman deserves jewellery that is as
                unique as her story. Founder Shri Gopinath Mohapatra started with three karigars in a small room in Balasore,
                working late into the night to perfect the art of Tarakasi and Temple jewellery.
              </p>
              <p>
                Over the decades, our workshop grew into a full-fledged showroom, but the soul of our craft remains unchanged.
                We still work with the same families of artisans who have been with us since the beginning. Many of our karigars
                are third-generation craftsmen, having inherited their skills from their fathers and grandfathers.
              </p>
              <p>
                Today, as we step into our fifth decade, we remain committed to the values that built us — uncompromising quality,
                transparent pricing, and a deep respect for the traditions of Odisha. Whether you are a bride looking for her
                dream trousseau or a collector seeking a rare Tarakasi piece, you will find the same warmth and expertise that
                has defined us since 1986.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const live = useCmsTable<{ id: string; name: string; role: string; era: string; image_url: string }[]>('team_members', [])
  const team = live.live && live.data.length > 0
    ? live.data.map((m) => ({ name: m.name, role: m.role ?? '', era: m.era ?? '', image: m.image_url ?? '' }))
    : teamPlaceholders.map((m) => ({ ...m, image: '' }))

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.team-card'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">The People</span>
          <h2 className="mt-2 font-display text-[30px] md:text-[32px] text-maroon">The People Behind the Craft</h2>
          <p className="mx-auto mt-3 max-w-xl font-body text-[15px] text-ink">Generations of dedication, artistry, and love for Odisha&rsquo;s jewellery traditions.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {team.map((member) => (
            <div key={member.name} className="team-card group overflow-hidden rounded-[20px] border border-teal-subtle bg-white transition-colors duration-300 hover:border-maroon hover:bg-maroon hover:shadow-card">
              <div className="aspect-[3/4] w-full overflow-hidden bg-ivory-light transition-colors duration-300 group-hover:bg-white/10">
                {member.image ? (
                  <img src={member.image} alt={member.name} loading="lazy" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="font-display text-[18px] text-teal-deep transition-colors duration-300 group-hover:text-cream">{member.name}</h3>
                <p className="mt-1 font-body text-[14px] font-medium text-maroon transition-colors duration-300 group-hover:text-tan">{member.role}</p>
                <p className="mt-1 font-body text-xs text-ink-muted transition-colors duration-300 group-hover:text-ivory/60">Since {member.era}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el || window.innerWidth < 1024) return
    const ctx = gsap.context(() => {
      // @ts-expect-error GSAP types don't accept bezier arrays at runtime
      gsap.fromTo(el.querySelectorAll('.value-card'), { opacity: 0, y: 35 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8, ease: easing, scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' } })
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ivory-light py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Our Values</span>
          <h2 className="mt-2 font-display text-[30px] md:text-[32px] text-maroon">What We Stand For</h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {values.map(({ Icon, title, desc }) => (
            <div key={title} className="value-card flex flex-col items-center rounded-[20px] bg-white p-6 text-center transition-shadow duration-300 hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon">
                <Icon size={20} className="text-ivory" />
              </div>
              <h3 className="mt-4 font-display text-[18px] text-maroon">{title}</h3>
              <p className="mt-2 font-body text-[14px] leading-[1.5] text-ink-muted">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="bg-ivory py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Visit Us</span>
        <h2 className="mt-2 font-display text-[30px] md:text-[32px] text-maroon">Experience Our Legacy</h2>
        <p className="mx-auto mt-3 max-w-xl font-body text-[15px] leading-relaxed text-ink">
          Visit our showroom or book a consultation to discover jewellery that carries generations of craftsmanship.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/book-appointment" className="inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 font-body text-[15px] font-medium text-ivory transition-transform hover:scale-[1.02]">
            Book an Appointment <ArrowRight size={16} />
          </Link>
          <Link to="/collections" className="inline-flex items-center gap-2 rounded-full bg-tan px-8 py-3.5 font-body text-[15px] font-medium text-maroon transition-transform hover:scale-[1.02]">
            Explore Our Collections <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <TimelineSection />
      <TeamSection />
      <ValuesSection />
      <CTASection />
    </>
  )
}