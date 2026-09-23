import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Calendar, Clock, User, Share2, ArrowRight, Gem } from 'lucide-react'
import { easing } from '../router/AppRouter'
import { useCmsTable } from '../lib/content'
import blogsData from '../data/blogs.json'

interface BlogPost { id: string; title: string; slug: string; excerpt: string; content: string; category: string; author: string; readTime: string; publishDate: string; image: string }

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

export default function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const live = useCmsTable<DbPost[]>('posts', [])
  const blogs = live.live && live.data.length > 0
    ? live.data.filter((p) => p.published !== false).map(toPost)
    : blogsFallback
  const post = blogs.find((b) => b.slug === slug)

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory pt-32 pb-24">
        <Gem size={56} className="mb-4 text-maroon/20" />
        <h1 className="mb-2 font-display text-2xl text-maroon">Article Not Found</h1>
        <p className="mb-6 font-body text-ink-muted">The article you are looking for does not exist or may have been removed.</p>
        <Link to="/journal" className="inline-flex items-center gap-2 rounded-full bg-maroon px-8 py-3.5 font-body text-[15px] font-medium text-ivory transition-transform hover:scale-[1.02]">
          Back to Journal <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  const relatedPosts = blogs.filter((b) => b.category === post.category && b.id !== post.id).slice(0, 3)
  const date = new Date(post.publishDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  const paragraphs = post.content.split('\n\n').filter(Boolean)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="min-h-screen bg-ivory pt-24">
      <article className="mx-auto max-w-4xl px-6">
        <Link to="/journal" className="mb-8 inline-flex items-center gap-1 font-body text-sm text-maroon/60 transition-colors hover:text-maroon">
          <ChevronLeft size={16} /> Back to Journal
        </Link>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: easing }}>
          <div className="mb-4 flex flex-wrap items-center gap-3 font-body text-xs text-ink-muted md:text-sm">
            <span className="rounded-full bg-maroon/10 px-3 py-1 font-medium text-maroon">{post.category}</span>
            <span className="flex items-center gap-1"><Calendar size={13} />{date}</span>
            <span className="flex items-center gap-1"><Clock size={13} />{post.readTime}</span>
            <span className="flex items-center gap-1"><User size={13} />{post.author}</span>
          </div>

          <h1 className="font-display text-3xl leading-[1.15] text-teal-deep sm:text-4xl md:text-5xl">{post.title}</h1>
          <p className="mt-4 font-body text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: easing }} className="mt-8 aspect-[2/1] overflow-hidden rounded-[22px] border border-teal-subtle bg-ivory-light shadow-card">
          {post.image ? (
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          ) : null}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3, ease: easing }} className="mt-10 md:mt-14">
          <div className="max-w-none space-y-5 font-body leading-relaxed text-ink/80">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-teal-subtle pt-8 sm:flex-row sm:items-center">
            <div className="font-body text-sm text-ink-muted">
              <span className="font-medium text-teal-deep">Written by {post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-body text-xs text-ink-muted"><Share2 size={13} /> Share:</span>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-teal-subtle px-3 py-1.5 font-body text-xs text-teal-dark/70 transition-colors hover:bg-maroon/10 hover:text-maroon">WhatsApp</a>
              <button onClick={() => navigator.clipboard?.writeText(shareUrl)} className="rounded-full bg-teal-subtle px-3 py-1.5 font-body text-xs text-teal-dark/70 transition-colors hover:bg-maroon/10 hover:text-maroon">Copy Link</button>
            </div>
          </div>
        </motion.div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="mx-auto mt-20 max-w-7xl px-6">
          <div className="border-t border-teal-subtle pt-12">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-display text-2xl text-teal-deep">Related Articles</h2>
              <Link to="/journal" className="flex items-center gap-1 font-body text-sm text-maroon transition-colors hover:text-maroon/80">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} to={`/journal/${rp.slug}`} className="group overflow-hidden rounded-[20px] border border-teal-subtle bg-white transition-shadow duration-300 hover:shadow-card active:shadow-card">
                  <div className="aspect-[16/9] w-full overflow-hidden bg-ivory-light">
                    {rp.image ? (
                      <img src={rp.image} alt={rp.title} loading="lazy" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2 font-body text-xs text-ink-muted">
                      <span className="rounded-full bg-maroon/10 px-2 py-0.5 font-medium text-maroon">{rp.category}</span>
                      <span>{rp.readTime}</span>
                    </div>
                    <h3 className="font-display text-base leading-snug text-teal-deep transition-colors group-hover:text-maroon group-active:text-maroon">{rp.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 font-body text-xs font-medium text-maroon transition-all duration-300 group-hover:gap-2 group-active:gap-2">
                      Read Article <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}