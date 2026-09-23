import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X, Gem, ChevronRight } from 'lucide-react'
import SectionHeader from '../components/common/SectionHeader'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'
import categoriesData from '../data/categories.json'

interface Category { id: string; name: string; slug: string; description: string; image: string }

interface DbCategory { id: string; name: string; slug: string; description: string; image_url: string }
interface DbProduct {
  id: string; name: string; slug: string; category_id: string | null; price: number
  image_url: string; images: string[]; sort_order: number
}

interface CardProduct {
  id: string
  slug: string
  name: string
  category: string
  categoryName: string
  price: number
  image: string
}

const categoriesFallback = categoriesData as Category[]

const placeholderProducts: CardProduct[] = Array.from({ length: 24 }, (_, i) => ({
  id: `prod-${String(i + 1).padStart(2, '0')}`,
  slug: `prod-${String(i + 1).padStart(2, '0')}`,
  name: ['Tarakasi Necklace', 'Pattachitra Earrings', 'Temple Gold Bangles', 'Filigree Pendant', 'Odia Bridal Chitki', 'Gold Jhumka Set', 'Mangalsutra', 'Diamond Studs', 'Gold Anklet', 'Pearl Nathani', 'Antique Ring', 'Gold Chain', 'Chandbali Earrings', 'Kada Bracelet', 'Gold Nose Pin', 'Layered Necklace', 'Gold Cuff', 'Temple Earrings', 'Gold Bangle Set', 'Filigree Earrings', 'Mangalsutra Set', 'Gold Pendant Set', 'Antique Necklace', 'Daily Wear Ring'][i % 24],
  category: categoriesFallback[i % categoriesFallback.length].slug,
  categoryName: categoriesFallback[i % categoriesFallback.length].name,
  price: Math.floor(Math.random() * 250000) + 15000,
  image: '',
}))

export function priceLabel(price: number) {
  return price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Price on request'
}

const ITEMS_PER_PAGE = 12

function ProductCard({ product }: { product: CardProduct }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easing }}>
      <Link to={`/product/${product.slug}`} className="group block overflow-hidden rounded-[20px] border border-teal-subtle bg-white transition-colors duration-300 hover:border-maroon hover:bg-maroon hover:shadow-card active:border-maroon active:bg-maroon active:shadow-card">
        <div className="aspect-[4/5] bg-ivory-light flex items-center justify-center overflow-hidden transition-colors duration-300 group-hover:bg-white/10 group-active:bg-white/10">
          {product.image ? (
            <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <Gem size={36} className="text-maroon/15 group-hover:scale-110 group-hover:text-ivory/30 transition-all duration-500 group-active:scale-110 group-active:text-ivory/30" />
          )}
        </div>
        <div className="p-4 md:p-5">
          <span className="text-xs text-accent-gold font-medium transition-colors duration-300 group-hover:text-tan group-active:text-tan">{product.categoryName}</span>
          <h3 className="mt-1 text-base font-display text-teal-deep transition-colors duration-300 group-hover:text-cream group-active:text-cream">{product.name}</h3>
          <p className="mt-2 text-sm font-medium text-teal-deep transition-colors duration-300 group-hover:text-ivory/90 group-active:text-ivory/90">{priceLabel(product.price)}</p>
          <span className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-maroon opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300">
            View Details <ChevronRight size={12} className="transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  )
}

function FilterSidebar({ categories, selectedCat, setSelectedCat, searchQuery, setSearchQuery, isOpen, setIsOpen }: {
  categories: Category[]; selectedCat: string | null; setSelectedCat: (c: string | null) => void
  searchQuery: string; setSearchQuery: (q: string) => void
  isOpen: boolean; setIsOpen: (o: boolean) => void
}) {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-ivory border-r border-teal-subtle transform transition-transform duration-300 lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:border-none lg:transform-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} p-6 lg:p-0 overflow-y-auto`}>
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h3 className="text-lg font-display text-teal-dark">Filters</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 text-teal-dark/60 hover:text-teal-dark"><X size={20} /></button>
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-dark/30" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search jewellery..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-ivory-light border border-teal-subtle text-sm text-teal-dark placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 transition-colors" />
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-dark/50 mb-3">Categories</h4>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            <button onClick={() => { setSelectedCat(null); setSearchQuery('') }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedCat ? 'bg-maroon text-ivory' : 'text-teal-dark/70 hover:bg-teal-subtle'}`}>
              All Items
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCat === cat.slug ? 'bg-maroon text-ivory' : 'text-teal-dark/70 hover:bg-teal-subtle'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/20 z-40 lg:hidden" />}
    </>
  )
}

export default function CataloguePage() {
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const [selectedCat, setSelectedCat] = useState<string | null>(categoryParam)
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const liveCats = useCmsTable<DbCategory[]>('categories', [])
  const liveProducts = useCmsTable<DbProduct[]>('products', [])

  const categories: Category[] = liveCats.live && liveCats.data.length > 0
    ? liveCats.data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', image: c.image_url ?? '' }))
    : categoriesFallback

  const catNameById = useMemo(() => {
    const m = new Map<string, { slug: string; name: string }>()
    for (const c of categories) m.set(c.id, { slug: c.slug, name: c.name })
    return m
  }, [categories])

  const allProducts: CardProduct[] = useMemo(() => {
    if (!(liveProducts.live && liveProducts.data.length > 0)) return placeholderProducts
    return liveProducts.data.map((p) => {
      const cat = p.category_id ? catNameById.get(p.category_id) : undefined
      const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : []
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: cat?.slug ?? '',
        categoryName: cat?.name ?? 'Uncategorised',
        price: Number(p.price) || 0,
        image: imgs[0] ?? p.image_url ?? '',
      }
    })
  }, [liveProducts, catNameById])

  useEffect(() => {
    setSelectedCat(categoryParam)
    setVisibleCount(ITEMS_PER_PAGE)
  }, [categoryParam])

  const filtered = useMemo(() => {
    let result = allProducts
    if (selectedCat) result = result.filter((p) => p.category === selectedCat)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q))
    }
    return result
  }, [allProducts, selectedCat, searchQuery])

  const displayed = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div className="pt-24 pb-24 md:pb-36 bg-ivory min-h-screen">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader title="Our Catalogue" subtitle="Browse our complete collection of handcrafted jewellery — each piece a tribute to Odisha's timeless artistry." />

        <div className="flex gap-8">
          <FilterSidebar categories={categories} selectedCat={selectedCat} setSelectedCat={(c) => { setSelectedCat(c); setVisibleCount(ITEMS_PER_PAGE) }} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-teal-subtle text-sm text-teal-dark/70 hover:border-maroon/30 transition-colors">
                  <SlidersHorizontal size={16} /> Filters
                </button>
                <p className="text-sm text-teal-dark/50"><span className="font-medium text-teal-dark">{filtered.length}</span> pieces found</p>
              </div>
              <div className="hidden lg:block relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-dark/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9 pr-3 py-2 rounded-lg bg-ivory-light border border-teal-subtle text-sm text-teal-dark placeholder:text-teal-dark/30 focus:outline-none focus:border-accent-gold/50 w-48 transition-colors" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Gem size={48} className="mx-auto text-teal-dark/20 mb-4" />
                <p className="text-teal-dark/50 font-body">No pieces found matching your criteria.</p>
                <button onClick={() => { setSelectedCat(null); setSearchQuery('') }} className="mt-4 text-sm text-accent-gold hover:text-accent-gold/80 transition-colors">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {displayed.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-12">
                    <button onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)} className="px-6 py-3 rounded-full bg-maroon text-ivory text-sm font-medium hover:bg-maroon/90 transition-all hover:scale-[1.02]">
                      Load More ({filtered.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
