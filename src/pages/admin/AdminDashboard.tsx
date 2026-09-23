import { Link } from 'react-router-dom'
import SeedPanel from './SeedPanel'

const sections = [
  { to: '/admin/products', title: 'Products', desc: 'Catalogue items — price, details, photos' },
  { to: '/admin/categories', title: 'Categories', desc: 'Catalogue categories + featured flags' },
  { to: '/admin/posts', title: 'Journal', desc: 'Blog articles, categories, publishing' },
  { to: '/admin/collections', title: 'Collections', desc: 'Signature collections + their pieces' },
  { to: '/admin/schemes', title: 'Schemes', desc: 'Gold savings plans, benefits, terms' },
  { to: '/admin/team', title: 'Team', desc: 'People cards on the About page' },
  { to: '/admin/faqs', title: 'FAQs', desc: 'Home + Schemes page questions' },
  { to: '/admin/testimonials', title: 'Testimonials', desc: 'Customer reviews on the home page' },
  { to: '/admin/content', title: 'Site content', desc: 'Contact details, hero + about text' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-display text-3xl text-teal-deep">Content manager</h1>
      <p className="mt-2 font-body text-sm text-ink-muted">
        Edit the website's catalogue, journal and content. Changes go live instantly — no coding needed.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <div key={s.to} className="flex flex-col rounded-[20px] border border-teal-subtle bg-white p-6 shadow-card">
            <h2 className="font-display text-xl text-teal-deep">{s.title}</h2>
            <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-ink-muted">{s.desc}</p>
            <Link to={s.to} className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-maroon px-5 py-2 font-body text-xs font-medium text-ivory transition-all hover:bg-maroon/90">
              Open →
            </Link>
          </div>
        ))}
      </div>
      <SeedPanel />
      <Link to="/" className="mt-6 inline-block font-body text-sm text-maroon hover:underline">← Back to website</Link>
    </div>
  )
}
