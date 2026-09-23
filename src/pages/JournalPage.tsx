import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Calendar, Clock, ArrowRight } from 'lucide-react'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'
import blogsData from '../data/blogs.json'

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string; content: string
  category: string; author: string; readTime: string; publishDate: string; image: string
}

interface DbPost {
  id: string; title: string; slug: string; excerpt: string; content: string
  category: string; author: string; read_time: string; publish_date: string | null
  image_url: string; published: boolean
}

const blogsFallback = blogsData as BlogPost[]

function toPost(p: DbPost): BlogPost {
  return {
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? '', content: p.content ?? '',
    category: p.category ?? '', author: p.author ?? '', readTime: p.read_time ?? '',
    publishDate: p.publish_date ?? '', image: p.image_url ?? '',
  }
}

function usePosts(): BlogPost[] {
  const live = useCmsTable<DbPost[]>('posts', [])
  if (live.live && live.data.length > 0) {
    return live.data.filter((p) => p.published !== false).map(toPost)
  }
  return blogsFallback
}

function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.publishDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easing }}>
      <Link to={`/journal/${post.slug}`} className="group block overflow-hidden rounded-[20px] border border-teal-subtle bg-white transition-shadow duration-300 hover:shadow-card active:shadow-card">
        <div className="aspect-[16/9] w-full overflow-hidden bg-ivory-light">
          {post.image ? (
            <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="p-5 md:p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3 font-body text-xs text-ink-muted">
            <span className="rounded-full bg-maroon/10 px-2.5 py-1 font-medium text-maroon">{post.category}</span>
            <span className="flex items-center gap-1"><Calendar size={12} />{date}</span>
            <span className="flex items-center gap-1"><Clock size={12} />{post.readTime}</span>
          </div>
          <h3 className="font-display text-lg leading-snug text-teal-deep transition-colors group-hover:text-maroon group-active:text-maroon md:text-xl">{post.title}</h3>
          <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-ink-muted">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-between border-t border-teal-subtle pt-4">
            <span className="font-body text-xs text-ink-muted">By {post.author}</span>
            <span className="inline-flex items-center gap-1 font-body text-xs font-medium text-maroon transition-all duration-300 group-hover:gap-2 group-active:gap-2">
              Read More <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const blogs = usePosts()
  const allCategories = [...new Set(blogs.map((b) => b.category))]

  const filtered = useMemo(() => {
    let result = [...blogs]
    if (activeCategory) result = result.filter((b) => b.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const da = new Date(a.publishDate).getTime()
      const db = new Date(b.publishDate).getTime()
      return sortOrder === 'newest' ? db - da : da - db
    })
    return result
  }, [activeCategory, searchQuery, sortOrder])

  return (
    <div className="min-h-screen bg-ivory pt-24">
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <span className="font-body text-[15px] tracking-[0.08em] text-teal-deep">Blogs</span>
            <h1 className="mt-4 font-display text-[44px] md:text-[56px] leading-[1.1] text-teal-deep">The Journal</h1>
            <p className="mt-6 max-w-2xl font-body text-[17px] leading-[1.6] text-ink">Stories, guides, and insights from the world of Mahalaxmi Jewellery.</p>
          </div>

          <div className="mb-10 mt-10 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${!activeCategory ? 'bg-maroon text-ivory' : 'bg-teal-subtle text-teal-dark/70 hover:bg-maroon/10'}`}>
                All
              </button>
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-maroon text-ivory' : 'bg-teal-subtle text-teal-dark/70 hover:bg-maroon/10'}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-dark/30" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search articles..." className="w-44 rounded-lg border border-teal-subtle bg-white py-2 pl-9 pr-3 font-body text-sm text-teal-deep placeholder:text-teal-dark/30 transition-colors focus:border-tan focus:outline-none" />
              </div>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="rounded-lg border border-teal-subtle bg-white px-3 py-2 font-body text-sm text-teal-deep transition-colors focus:border-tan focus:outline-none">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-body text-ink-muted">No articles found matching your criteria.</p>
              <button onClick={() => { setActiveCategory(null); setSearchQuery('') }} className="mt-4 font-body text-sm text-maroon transition-colors hover:text-maroon/80">Clear filters</button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {filtered.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}