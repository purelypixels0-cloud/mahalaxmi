import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gem, MessageCircle, ChevronLeft, Shield, Weight, Ruler, ArrowRight } from 'lucide-react'
import FlipButton from '../components/common/FlipButton'
import { easing } from '../router/AppRouter'
import { supabase } from '../lib/supabase'
import { useCmsTable } from '../lib/content'
import { priceLabel } from './CataloguePage'

const WHATSAPP_NUMBER = '919937012345'

interface DbProduct {
  id: string; slug: string; name: string; category_id: string | null
  price: number; image_url: string; images: string[]; sort_order: number
}
interface DbCategory { id: string; name: string }

const productData: Record<string, { name: string; category: string; price: number; weight: string; purity: string; makingCharge: string; description: string; details: string[] }> = {
  'prod-01': { name: 'Tarakasi Necklace', category: 'Necklaces', price: 185000, weight: '32.5 g', purity: '22K (916)', makingCharge: '14%', description: 'An exquisite silver filigree necklace handcrafted by master artisans in Balasore. Each wire is carefully twisted and shaped into intricate floral patterns that reflect centuries of Odisha\'s Tarakasi tradition.', details: ['Handcrafted by 3rd generation Tarakasi artisans', 'Lightweight construction for comfortable daily wear', 'Traditional floral and peacock motifs', 'Secure lobster claw clasp with safety chain', 'Comes with authenticity certificate and hallmark card'] },
}

function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0)
  const thumbs = images.slice(0, 5)
  const main = thumbs[Math.min(active, Math.max(0, thumbs.length - 1))]
  const pads = Math.max(0, 4 - thumbs.length)
  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-teal-dark to-plum flex items-center justify-center shadow-card">
        {main ? (
          <img src={main} alt="" className="h-full w-full object-cover" />
        ) : (
          <Gem size={64} className="text-ivory/20" />
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {thumbs.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setActive(i)}
            className={`aspect-square overflow-hidden rounded-xl flex items-center justify-center transition-all ${i === active ? 'ring-2 ring-maroon ring-offset-2 ring-offset-ivory' : 'opacity-80 hover:opacity-100'}`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
        {Array.from({ length: pads }).map((_, i) => (
          <div key={`pad-${i}`} className="aspect-square rounded-xl bg-gradient-to-tr from-teal-muted to-plum-muted flex items-center justify-center">
            <Gem size={18} className="text-ivory/20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductInfo({ product }: { product: typeof productData[string] }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent-gold font-medium">{product.category}</p>
        <h1 className="mt-1 text-3xl md:text-4xl font-display text-teal-dark">{product.name}</h1>
        <p className="mt-4 text-teal-dark/70 font-body leading-relaxed">{product.description}</p>
      </div>

      <div className="text-3xl font-display text-plum">{priceLabel(product.price)}</div>

      <div className="grid grid-cols-3 gap-4 py-6 border-y border-teal-subtle">
        <div className="text-center">
          <Weight size={18} className="mx-auto text-accent-gold" />
          <p className="mt-1 text-xs text-teal-dark/50">Weight</p>
          <p className="text-sm font-medium text-teal-dark">{product.weight}</p>
        </div>
        <div className="text-center">
          <Shield size={18} className="mx-auto text-accent-gold" />
          <p className="mt-1 text-xs text-teal-dark/50">Purity</p>
          <p className="text-sm font-medium text-teal-dark">{product.purity}</p>
        </div>
        <div className="text-center">
          <Ruler size={18} className="mx-auto text-accent-gold" />
          <p className="mt-1 text-xs text-teal-dark/50">Making</p>
          <p className="text-sm font-medium text-teal-dark">{product.makingCharge}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-teal-dark">Key Features</h3>
        <ul className="space-y-2">
          {product.details.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-teal-dark/70">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-gold shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <FlipButton href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi! I am interested in the ${product.name} (₹${product.price.toLocaleString('en-IN')}) at Mahalaxmi Jewellery.`} variant="pantone">
          <MessageCircle size={16} /> Enquire on WhatsApp
        </FlipButton>
        <FlipButton to="/book-appointment" variant="gold">Book a Visit →</FlipButton>
      </div>
    </div>
  )
}

function RelatedProducts({ currentSlug, currentCategory }: { currentSlug: string; currentCategory: string }) {
  const liveProducts = useCmsTable<DbProduct[]>('products', [])
  const liveCats = useCmsTable<DbCategory[]>('categories', [])

  const related = useMemo(() => {
    if (!(liveProducts.live && liveProducts.data.length > 0)) return []
    const catName = new Map((liveCats.data ?? []).map((c) => [c.id, c.name] as const))
    return liveProducts.data
      .filter((p) => p.slug !== currentSlug)
      .sort((a, b) => {
        const aSame = currentCategory && catName.get(a.category_id ?? '') === currentCategory ? 0 : 1
        const bSame = currentCategory && catName.get(b.category_id ?? '') === currentCategory ? 0 : 1
        return aSame - bSame || (a.sort_order ?? 0) - (b.sort_order ?? 0)
      })
      .slice(0, 4)
      .map((p) => {
        const imgs = Array.isArray(p.images) ? (p.images as string[]).filter(Boolean) : []
        return {
          slug: p.slug, name: p.name,
          category: catName.get(p.category_id ?? '') ?? '',
          price: Number(p.price) || 0,
          image: imgs[0] ?? (p.image_url as string) ?? '',
        }
      })
  }, [liveProducts, liveCats, currentSlug, currentCategory])

  if (related.length === 0) return null

  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-display text-teal-dark">You May Also Like</h2>
        <Link to="/catalogue" className="text-sm text-accent-gold hover:text-accent-gold/80 transition-colors flex items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {related.map((p) => (
          <Link key={p.slug} to={`/product/${p.slug}`} className="group overflow-hidden rounded-[20px] bg-white border border-teal-subtle transition-colors duration-300 hover:border-maroon hover:bg-maroon hover:shadow-card active:border-maroon active:bg-maroon active:shadow-card">
            <div className="aspect-[4/5] bg-ivory-light flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-white/10 group-active:bg-white/10">
              {p.image ? (
                <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <Gem size={24} className="text-maroon/15 group-hover:scale-110 group-hover:text-ivory/30 transition-all duration-500 group-active:scale-110 group-active:text-ivory/30" />
              )}
            </div>
            <div className="p-4">
              <p className="text-xs text-accent-gold font-medium transition-colors duration-300 group-hover:text-tan group-active:text-tan">{p.category}</p>
              <h3 className="text-sm font-display text-teal-deep mt-0.5 transition-colors duration-300 group-hover:text-cream group-active:text-cream">{p.name}</h3>
              <p className="text-sm font-medium text-teal-deep mt-2 transition-colors duration-300 group-hover:text-ivory/90 group-active:text-ivory/90">{priceLabel(p.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function ProductDetailPage() {
  const { id: slug } = useParams<{ id: string }>()
  const staticProduct = slug ? productData[slug] : undefined
  const [live, setLive] = useState<{ info: typeof productData[string]; images: string[] } | null>(null)
  const [liveDone, setLiveDone] = useState(!supabase)

  useEffect(() => {
    if (!supabase || !slug) {
      setLiveDone(true)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*, categories(name)')
          .or(`slug.eq.${slug},id.eq.${slug}`)
          .maybeSingle()
        if (!cancelled && data) {
          const imgs = Array.isArray(data.images) && data.images.length > 0
            ? (data.images as string[]).filter(Boolean)
            : data.image_url ? [data.image_url as string] : []
          setLive({
            info: {
              name: data.name,
              category: (data.categories as { name?: string } | null)?.name ?? '',
              price: Number(data.price) || 0,
              weight: data.weight ?? '',
              purity: data.purity ?? '',
              makingCharge: data.making_charge ?? '',
              description: data.description ?? '',
              details: Array.isArray(data.details) ? data.details : [],
            },
            images: imgs,
          })
        }
      } catch {
        /* fall back to static */
      }
      if (!cancelled) setLiveDone(true)
    })()
    return () => {
      cancelled = true
    }
  }, [slug])

  const product = live?.info ?? staticProduct
  const images = live ? live.images : []

  if (!product) {
    if (!liveDone) {
      return (
        <div className="pt-32 pb-24 bg-ivory min-h-screen">
          <div className="mx-auto max-w-7xl px-6">
            <div className="h-8 w-48 rounded-lg bg-teal-subtle animate-pulse" />
            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div className="aspect-[4/5] rounded-2xl bg-teal-subtle animate-pulse" />
              <div className="space-y-4">
                <div className="h-10 w-3/4 rounded-lg bg-teal-subtle animate-pulse" />
                <div className="h-4 w-full rounded bg-teal-subtle animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-teal-subtle animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="pt-32 pb-24 bg-ivory min-h-screen flex flex-col items-center justify-center">
        <Gem size={56} className="text-teal-dark/20 mb-4" />
        <h1 className="text-2xl font-display text-teal-dark mb-2">Product Not Found</h1>
        <p className="text-teal-dark/50 font-body mb-6">The piece you are looking for is no longer available or does not exist.</p>
        <FlipButton to="/catalogue" variant="gold">Back to Catalogue →</FlipButton>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-24 md:pb-36 bg-ivory min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <Link to="/catalogue" className="inline-flex items-center gap-1 text-sm text-teal-dark/50 hover:text-teal-dark transition-colors mb-8">
          <ChevronLeft size={16} /> Back to Catalogue
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: easing }}>
            <ImageGallery images={images} />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, ease: easing }}>
            <ProductInfo product={product} />
          </motion.div>
        </div>

        <RelatedProducts currentSlug={slug ?? ''} currentCategory={product.category} />
      </div>
    </div>
  )
}
