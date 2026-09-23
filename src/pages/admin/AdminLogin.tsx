import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    onDone()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-maroon px-6 font-body">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[22px] bg-ivory p-8 shadow-elevated">
        <img src="/logo-nav.png" alt="Mahalaxmi Jewellery" className="h-12 w-auto select-none" draggable={false} />
        <h1 className="mt-5 font-display text-2xl text-teal-deep">Admin sign in</h1>
        <p className="mt-1 font-body text-sm text-ink-muted">Restricted area — authorised staff only.</p>
        <label className="mt-6 block font-body text-xs font-medium text-teal-deep">
          Email
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-teal-subtle bg-white px-4 py-2.5 text-sm text-teal-deep outline-none transition-colors placeholder:text-teal-dark/30 focus:border-maroon"
            placeholder="owner@example.com" autoComplete="username"
          />
        </label>
        <label className="mt-4 block font-body text-xs font-medium text-teal-deep">
          Password
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-teal-subtle bg-white px-4 py-2.5 text-sm text-teal-deep outline-none transition-colors placeholder:text-teal-dark/30 focus:border-maroon"
            placeholder="••••••••" autoComplete="current-password"
          />
        </label>
        {error && <p className="mt-3 font-body text-xs text-red-600">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="mt-6 w-full rounded-full bg-maroon py-3 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 active:scale-95 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
