import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../components/admin/ui'
import categoriesData from '../../data/categories.json'
import collectionsData from '../../data/collections.json'
import schemesData from '../../data/schemes.json'
import blogsData from '../../data/blogs.json'
import faqsData from '../../data/faqs.json'

const schemeFaqs = [
  { question: 'How does the bonus gold work?', answer: 'The bonus is calculated as a percentage of your total savings over the scheme period. For example, if you save ₹1,00,000 in the Shree plan (30% bonus), you receive an additional ₹30,000 worth of gold at maturity — completely free.' },
  { question: 'Can I withdraw before the scheme matures?', answer: 'Yes, partial withdrawals are allowed with reduced bonus. For Mangala, you can withdraw after 12 months with a 15% bonus. For Shree, partial closure is allowed after 24 months with a 20% bonus. Early withdrawals in Suvarna Sanchay forfeit the bonus.' },
  { question: 'What happens if I miss a payment?', answer: 'Each scheme has a grace period. Suvarna Sanchay allows 2 missed installments, Mangala allows 3, and Shree provides a 7-day grace period each month with up to 5 missed installments allowed across the term. Beyond these limits, the bonus is forfeited.' },
  { question: 'Can I take delivery as jewellery instead of coins?', answer: 'Absolutely. With the Shree plan, you have the flexibility to take your gold as jewellery, coins, or bars — or a combination. This is one of the key advantages: your savings directly translate into the jewellery you love.' },
]

const teamSeed = [
  { name: 'Shri Gopinath Mohapatra', role: 'Founder', era: '1986' },
  { name: 'Anjali Mohapatra', role: 'Lead Designer', era: '2005' },
  { name: 'Ankit Mohapatra', role: 'Managing Director', era: '2015' },
  { name: 'Rohit Das', role: 'Master Karigar', era: '1995' },
]

const testimonialSeed = [
  { name: 'Sneha Patnaik', location: 'Balasore', rating: 5, text: 'I bought my bridal set from Mahalaxmi and the craftsmanship is simply breathtaking. The Tarakasi work is so delicate — I receive compliments every time I wear it.' },
  { name: 'Ravi Mohanty', location: 'Bhubaneswar', rating: 5, text: 'We have been customers for three generations. The quality is consistent, the prices are fair, and the gold purity is always guaranteed.' },
  { name: 'Priya Das', location: 'Cuttack', rating: 5, text: "The savings scheme helped me accumulate gold for my daughter's wedding without feeling the financial strain. We received a beautiful bonus too!" },
  { name: 'Arun Mishra', location: 'Kolkata', rating: 4, text: 'Even though I live in Kolkata, I travel to Balasore for all my jewellery needs. The custom design service is exceptional — they created a unique piece for my wife.' },
  { name: 'Laxmi Behera', location: 'Balasore', rating: 5, text: 'The staff explained every detail about hallmarking and making charges. For the first time, I felt completely confident about my jewellery purchase.' },
]

const pieceSeed = [
  { name: 'Tarakasi Pendant', price: 45000 }, { name: 'Filigree Earrings', price: 28000 },
  { name: 'Silver Cuff', price: 35000 }, { name: 'Temple Motif Ring', price: 18000 },
  { name: 'Filigree Bangles', price: 65000 }, { name: 'Tarakasi Choker', price: 85000 },
]

const productNames = [
  'Tarakasi Necklace', 'Pattachitra Earrings', 'Temple Gold Bangles', 'Filigree Pendant',
  'Odia Bridal Chitki', 'Gold Jhumka Set', 'Mangalsutra', 'Diamond Studs',
  'Gold Anklet', 'Pearl Nathani', 'Antique Ring', 'Gold Chain',
  'Chandbali Earrings', 'Kada Bracelet', 'Gold Nose Pin', 'Layered Necklace',
  'Gold Cuff', 'Temple Earrings', 'Gold Bangle Set', 'Filigree Earrings',
  'Mangalsutra Set', 'Gold Pendant Set', 'Antique Necklace', 'Daily Wear Ring',
]

function fmtErr(e: unknown): string {
  const m = e instanceof Error ? e.message : (e as { message?: string } | null)?.message ?? 'failed'
  if (m.includes('images')) return `${m} → run migration 002-product-images.sql in Supabase SQL Editor, then import again`
  if (m.includes('testimonials')) return `${m} → run migration 003-testimonials.sql in Supabase SQL Editor, then import again`
  return m
}

export default function SeedPanel() {
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const run = async () => {
    if (!supabase || busy) return
    if (!window.confirm('Copy the website\u2019s current content into the CMS? Existing entries are kept — only missing items are added.')) return
    const db = supabase
    setBusy(true)
    setDone(false)
    setLog([])
    const say = (s: string) => setLog((l) => [...l, s])
    const section = async (label: string, fn: () => Promise<string>) => {
      try {
        say(`${label}: ${await fn()}`)
      } catch (e) {
        say(`${label}: FAILED — ${fmtErr(e)}`)
      }
    }

    await section('Categories', async () => {
      let n = 0
      for (const [i, c] of (categoriesData as { name: string; slug: string; description: string; featured?: boolean }[]).entries()) {
        const { error } = await db.from('categories').upsert(
          { name: c.name, slug: c.slug, description: c.description, image_url: '', featured: !!c.featured, sort_order: i },
          { onConflict: 'slug' }
        )
        if (error) throw error
        n++
      }
      return `${n} saved`
    })

    await section('Products', async () => {
      const { data: cats } = await db.from('categories').select('id,slug')
      const catId = (slug: string) => (cats as { id: string; slug: string }[] | null)?.find((c) => c.slug === slug)?.id ?? null
      const { data: existingProducts } = await db.from('products').select('slug')
      const haveSlugs = new Set(((existingProducts ?? []) as { slug: string }[]).map((p) => p.slug))
      const catSlugs = (categoriesData as { slug: string }[]).map((c) => c.slug)
      let pn = 0
      for (let i = 0; i < productNames.length; i++) {
        const name = productNames[i]
        let slug = slugify(name)
        if (haveSlugs.has(slug)) slug = `${slug}-${i + 1}`
        if (haveSlugs.has(slug)) continue
        const { error } = await db.from('products').insert({
          name, slug, category_id: catId(catSlugs[i % catSlugs.length]),
          price: 0, description: '', details: [], image_url: '', images: [], sort_order: i,
        })
        if (error) throw error
        haveSlugs.add(slug)
        pn++
      }
      return `${pn} created (set prices + photos in Products)`
    })

    await section('Collections', async () => {
      let cn = 0, pin = 0
      for (const [i, c] of (collectionsData as { name: string; slug: string; description: string; story: string; pieces: number }[]).entries()) {
        const { error } = await db.from('collections').upsert(
          { name: c.name, slug: c.slug, description: c.description, story: c.story, image_url: '', pieces: c.pieces, sort_order: i },
          { onConflict: 'slug' }
        )
        if (error) throw error
        cn++
        const { data: col } = await db.from('collections').select('id').eq('slug', c.slug).maybeSingle()
        const colId = (col as { id: string } | null)?.id
        if (colId) {
          const { data: have } = await db.from('collection_pieces').select('id').eq('collection_id', colId).limit(1)
          if (!have || have.length === 0) {
            for (const [j, p] of pieceSeed.entries()) {
              const { error } = await db.from('collection_pieces').insert({ collection_id: colId, name: p.name, price: p.price, sort_order: j })
              if (error) throw error
              pin++
            }
          }
        }
      }
      return `${cn} saved, ${pin} pieces created`
    })

    await section('Schemes', async () => {
      const { data: haveSchemes } = await db.from('schemes').select('name')
      const haveNames = new Set(((haveSchemes ?? []) as { name: string }[]).map((s) => s.name))
      let sn = 0
      for (const [i, s] of (schemesData as { name: string; tagline: string; durationMonths: number; bonusPercentage: number; minMonthlyInstallment: number; benefits: string[]; terms: string[] }[]).entries()) {
        if (haveNames.has(s.name)) continue
        const { error } = await db.from('schemes').insert({
          name: s.name, tagline: s.tagline, duration_months: s.durationMonths,
          bonus_percentage: s.bonusPercentage, min_installment: s.minMonthlyInstallment,
          benefits: s.benefits, terms: s.terms, sort_order: i,
        })
        if (error) throw error
        sn++
      }
      return `${sn} created`
    })

    await section('Journal', async () => {
      let bn = 0
      for (const b of blogsData as { title: string; slug: string; excerpt: string; content: string; category: string; author: string; readTime: string; publishDate: string }[]) {
        const { error } = await db.from('posts').upsert(
          {
            title: b.title, slug: b.slug, excerpt: b.excerpt, content: b.content,
            category: b.category, author: b.author, read_time: b.readTime,
            publish_date: b.publishDate || null, image_url: '', published: true,
          },
          { onConflict: 'slug' }
        )
        if (error) throw error
        bn++
      }
      return `${bn} articles saved`
    })

    await section('FAQs', async () => {
      const { data: haveFaqs } = await db.from('faqs').select('question')
      const haveQ = new Set(((haveFaqs ?? []) as { question: string }[]).map((f) => f.question))
      let fn = 0
      const allFaqs = [
        ...(faqsData as { question: string; answer: string }[]).map((f, i) => ({ question: f.question, answer: f.answer, section: 'home', sort_order: i })),
        ...schemeFaqs.map((f, i) => ({ question: f.question, answer: f.answer, section: 'schemes', sort_order: i })),
      ]
      for (const f of allFaqs) {
        if (haveQ.has(f.question)) continue
        const { error } = await db.from('faqs').insert(f)
        if (error) throw error
        fn++
      }
      return `${fn} created`
    })

    await section('Team', async () => {
      const { data: haveTeam } = await db.from('team_members').select('name')
      const haveNames = new Set(((haveTeam ?? []) as { name: string }[]).map((t) => t.name))
      let tn = 0
      for (const [i, t] of teamSeed.entries()) {
        if (haveNames.has(t.name)) continue
        const { error } = await db.from('team_members').insert({ ...t, sort_order: i })
        if (error) throw error
        tn++
      }
      return `${tn} created`
    })

    await section('Testimonials', async () => {
      const { data: haveT } = await db.from('testimonials').select('name')
      const haveNames = new Set(((haveT ?? []) as { name: string }[]).map((t) => t.name))
      let tn = 0
      for (const [i, t] of testimonialSeed.entries()) {
        if (haveNames.has(t.name)) continue
        const { error } = await db.from('testimonials').insert({ ...t, sort_order: i })
        if (error) throw error
        tn++
      }
      return `${tn} created`
    })

    await section('Defaults', async () => {
      const kv: [string, string, object][] = [
        ['homepage_content', 'hero', {
          eyebrow: 'Rooted in Odisha • Since 1986',
          title: 'Jewellery That Understands Your Traditions.',
          sub1: 'Not every ornament becomes an heirloom.',
          sub2: 'We create jewellery inspired by Odisha’s rich traditions, crafted to celebrate every milestone for generations to come.',
        }],
        ['homepage_content', 'about', {
          eyebrow: 'About Us',
          title: 'Crafting Trust Since 1986',
          body: 'Founded in 1986 by Shri Gopinath Mohapatra in the heart of Balasore, Mahalaxmi Jewellery began as a small workshop with three karigars and a singular vision — to make heirloom-quality jewellery accessible to every Odia family. What started as a family craft has grown into one of Odisha’s most trusted jewellery destinations. Today, three generations later, our commitment remains unchanged. Every piece that leaves our atelier carries the legacy of Odisha’s rich craftsmanship — from the delicate silver filigree of Tarakasi to the timeless elegance of Temple jewellery. We don’t just sell jewellery; we preserve traditions, celebrate milestones, and build relationships that span generations.',
        }],
        ['site_settings', 'contact', {
          phone: '+91 9937012345', whatsapp: '919937012345',
          email: 'hello@mahalaxmijewellery.com', address: 'Balasore, Odisha, India',
          hours: ['Monday – Saturday: 10:00 AM – 9:00 PM', 'Sunday: 11:00 AM – 7:00 PM'],
        }],
      ]
      for (const [table, key, value] of kv) {
        const { error } = await db.from(table).upsert({ key, value }, { onConflict: 'key' })
        if (error) throw error
      }
      return 'homepage + contact saved'
    })

    setDone(true)
    setBusy(false)
  }

  return (
    <div className="mt-8 rounded-[20px] border border-dashed border-maroon/30 bg-maroon/5 p-6">
      <h2 className="font-display text-lg text-maroon">First-time setup</h2>
      <p className="mt-1 font-body text-sm text-ink-muted">
        Copy the website's current categories, products, collections, schemes, articles, FAQs, team and
        reviews into the CMS as a starting point. Safe to run more than once — existing entries are kept.
      </p>
      <button
        onClick={run} disabled={busy}
        className="mt-4 rounded-full bg-maroon px-6 py-2.5 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 active:scale-95 disabled:opacity-60"
      >
        {busy ? 'Importing…' : done ? 'Import again' : 'Import existing site content'}
      </button>
      {log.length > 0 && (
        <ul className="mt-4 space-y-1">
          {log.map((l, i) => (
            <li key={i} className="font-body text-xs text-teal-deep">• {l}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
