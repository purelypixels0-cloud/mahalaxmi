import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="min-h-screen bg-ivory font-body">
      <header className="flex items-center justify-between bg-maroon px-6 py-4">
        <div className="flex items-center gap-3">
          <img src="/logo-loader.png" alt="Mahalaxmi Jewellery" className="h-8 w-auto select-none" draggable={false} />
          <span className="font-body text-[11px] uppercase tracking-[0.3em] text-ivory/60">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="rounded-full border border-ivory/25 px-4 py-1.5 font-body text-xs text-ivory transition-colors hover:bg-ivory/10">
            View site
          </Link>
          <button onClick={signOut} className="rounded-full bg-ivory px-4 py-1.5 font-body text-xs font-medium text-maroon transition-colors hover:bg-ivory/85">
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
