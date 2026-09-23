import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Gem, ArrowRight } from 'lucide-react'
import { easing } from '../router/AppRouter'
import { supabase } from '../lib/supabase'
import { useCmsTable } from '../lib/content'
import { priceLabel } from './CataloguePage'
import collectionsData from '../data/collections.json'

interface Collection { id: string; name: string; slug: string; description: string; story: string; image: string; pieces: number }

interface DbCollection { id: string; name: string; slug: string; description: string; story: string; image_url: string; pieces: number }
interface DbPiece { id: string; name: string; price: number; image_url: string }

const collectionsFallback = collectionsData as Collection[]

const placeholderPieces = Array.from({ length: 6 }, (_, i) => ({
  id: `piece-${i + 1}`, name: ['Tarakasi Pendant', 'Filigree Earrings', 'Silver Cuff', 'Temple Motif Ring', 'Filigree Bangles', 'Tarakasi Choker'][i],
  price: [45000, 28000, 35000, 18000, 65000, 85000][i], image: '',
}))


export default function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const liveCollections = useCmsTable<DbCollection[]>('collections', [])
  const [livePieces, setLivePieces] = useState<DbPiece[] | null>(null)

  const liveCol = liveCollections.live ? liveCollections.data.find((c) => c.slug === slug) : undefined
  const staticCol = collectionsFallback.find((c) => c.slug === slug)
  const collection: Collection | undefined = liveCol
    ? { id: liveCol.id, name: liveCol.name, slug: liveCol.slug, description: liveCol.description ?? '', story: liveCol.story ?? '', image: liveCol.image_url ?? '', pieces: liveCol.pieces ?? 0 }
    : staticCol

  useEffect(() => {
    if (!supabase || !liveCol) {
      setLivePieces(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase.from('collection_pieces').select('*').eq('collection_id', liveCol.id).order('sort_order').order('created_at')
        if (!cancelled && !error && data && data.length > 0) setLivePieces(data as DbPiece[])
        else if (!cancelled) setLivePieces(null)
      } catch {
        if (!cancelled) setLivePieces(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [liveCol?.id])

  const pieces = (livePieces ?? placeholderPieces).map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    image: 'image_url' in p ? (p.image_url ?? '') : (p.image ?? ''),
  }))

  if (!collection) {
    return (
      <div className="bg-ivory min-h-screen flex flex-col items-center justify-center pt-32 pb-24">
        <Gem size={56} className="mb-4 text-maroon/20" />
        <h1 className="mb-2 font-display text-2xl text-maroon">Collection Not Found</h1>
        <p className="mb-6 font-body text-ink-muted">This collection does not exist or may have been renamed.</p>
        <Link to="/collections" className="inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 font-body text-[15px] font-medium text-ivory transition-transform hover:scale-[1.02]">
          Browse Collections <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-ivory min-h-screen">
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link to="/collections" className="mb-8 inline-flex items-center gap-1 font-body text-sm text-maroon/60 transition-colors hover:text-maroon">
            <ChevronLeft size={16} /> All Collections
          </Link>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: easing }}>
            <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">Collection</span>
            <h1 className="mt-3 font-display text-[44px] md:text-[56px] leading-[1.1] text-maroon">
              {collection.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 font-body text-sm text-ink-muted">
              <span>{collection.pieces} pieces</span>
              <span className="h-1 w-1 rounded-full bg-maroon/20" />
              <span>Handcrafted in Odisha</span>
            </div>
            <p className="mt-8 max-w-3xl font-body text-[17px] leading-[1.7] text-ink">
              {collection.story}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-16 md:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="aspect-[2/1] w-full overflow-hidden rounded-[22px] border border-teal-subtle bg-ivory-light">
            {collection.image ? (
              <img src={collection.image} alt={collection.name} className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="mt-14 md:mt-16 text-center">
            <span className="font-body text-[15px] tracking-[0.08em] text-maroon/75">The Pieces</span>
            <h2 className="mt-2 font-display text-[30px] md:text-[32px] text-maroon">Explore the {collection.name}</h2>
            <p className="mx-auto mt-3 max-w-xl font-body text-[15px] text-ink">Each piece in this collection is a testament to the skill of our master artisans.</p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
            {pieces.map((piece, i) => (
              <motion.div key={piece.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1, ease: easing }}
                className="group overflow-hidden rounded-[20px] border border-teal-subtle bg-white transition-shadow duration-300 hover:shadow-card">
                <div className="aspect-[4/5] w-full overflow-hidden bg-ivory-light">
                  {piece.image ? (
                    <img src={piece.image} alt={piece.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="p-4 md:p-5">
                  <h3 className="font-display text-[16px] text-teal-deep transition-colors group-hover:text-maroon">{piece.name}</h3>
                  <p className="mt-1 font-body text-sm font-medium text-maroon">{priceLabel(piece.price)}</p>
                  <span className="mt-3 inline-flex items-center gap-1 font-body text-xs font-medium text-maroon opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View Details <ArrowRight size={12} />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/book-appointment" className="inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 font-body text-[15px] font-medium text-ivory transition-transform hover:scale-[1.02]">
              Book an Appointment to View <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}