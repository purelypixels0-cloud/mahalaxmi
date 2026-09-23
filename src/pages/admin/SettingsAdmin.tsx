import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Field, inputCls } from '../../components/admin/ui'

interface ContactSettings {
  phone: string
  whatsapp: string
  email: string
  address: string
  hours: string[]
}

interface HeroContent {
  eyebrow: string
  title: string
  sub1: string
  sub2: string
}

interface AboutContent {
  eyebrow: string
  title: string
  body: string
}

async function loadKV<T>(table: 'homepage_content' | 'site_settings', key: string): Promise<T | null> {
  if (!supabase) return null
  const { data, error } = await supabase.from(table).select('value').eq('key', key).maybeSingle()
  if (error || !data) return null
  return (data as { value: T }).value
}

export default function SettingsAdmin() {
  const [contact, setContact] = useState<ContactSettings>({ phone: '', whatsapp: '', email: '', address: '', hours: [] })
  const [hoursText, setHoursText] = useState('')
  const [hero, setHero] = useState<HeroContent>({ eyebrow: '', title: '', sub1: '', sub2: '' })
  const [about, setAbout] = useState<AboutContent>({ eyebrow: '', title: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      const [c, h, a] = await Promise.all([
        loadKV<ContactSettings>('site_settings', 'contact'),
        loadKV<HeroContent>('homepage_content', 'hero'),
        loadKV<AboutContent>('homepage_content', 'about'),
      ])
      if (c) {
        setContact({ phone: c.phone ?? '', whatsapp: c.whatsapp ?? '', email: c.email ?? '', address: c.address ?? '', hours: Array.isArray(c.hours) ? c.hours : [] })
        setHoursText(Array.isArray(c.hours) ? c.hours.join('\n') : '')
      }
      if (h) setHero({ eyebrow: h.eyebrow ?? '', title: h.title ?? '', sub1: h.sub1 ?? '', sub2: h.sub2 ?? '' })
      if (a) setAbout({ eyebrow: a.eyebrow ?? '', title: a.title ?? '', body: a.body ?? '' })
      setLoading(false)
    })()
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    setSaved(false)
    try {
      const rows = [
        { table: 'site_settings', key: 'contact', value: { ...contact, hours: hoursText.split('\n').map((l) => l.trim()).filter(Boolean) } },
        { table: 'homepage_content', key: 'hero', value: hero },
        { table: 'homepage_content', key: 'about', value: about },
      ]
      for (const r of rows) {
        const { error } = await supabase.from(r.table).upsert({ key: r.key, value: r.value }, { onConflict: 'key' })
        if (error) throw error
      }
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setBusy(false)
  }

  if (loading) return <p className="font-body text-sm text-ink-muted">Loading…</p>

  return (
    <div>
      <h1 className="font-display text-3xl text-teal-deep">Site content</h1>
      <p className="mt-1 font-body text-sm text-ink-muted">Contact details, home page hero and about text. Changes go live instantly.</p>
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-8 rounded-[20px] border border-teal-subtle bg-white p-6 shadow-card md:p-8">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        {saved && <p className="rounded-xl bg-green-50 px-4 py-2.5 font-body text-sm text-green-800">Saved — the website is updated.</p>}

        <section>
          <h2 className="font-display text-xl text-maroon">Contact details</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Field label="Phone (display)">
              <input className={inputCls} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+91 9937012345" />
            </Field>
            <Field label="WhatsApp number (digits only)">
              <input className={inputCls} value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} placeholder="919937012345" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Email">
              <input className={inputCls} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="hello@mahalaxmijewellery.com" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Showroom address">
              <input className={inputCls} value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} placeholder="Balasore, Odisha, India" />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Store hours (one per line)">
              <textarea className={inputCls} rows={2} value={hoursText} onChange={(e) => setHoursText(e.target.value)} placeholder={'Monday – Saturday: 10:00 AM – 9:00 PM\nSunday: 11:00 AM – 7:00 PM'} />
            </Field>
          </div>
        </section>

        <section className="border-t border-teal-subtle pt-6">
          <h2 className="font-display text-xl text-maroon">Home hero</h2>
          <div className="mt-4 space-y-5">
            <Field label="Small line above title">
              <input className={inputCls} value={hero.eyebrow} onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })} />
            </Field>
            <Field label="Main title">
              <input className={inputCls} value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} />
            </Field>
            <Field label="Intro line 1">
              <input className={inputCls} value={hero.sub1} onChange={(e) => setHero({ ...hero, sub1: e.target.value })} />
            </Field>
            <Field label="Intro line 2">
              <textarea className={inputCls} rows={2} value={hero.sub2} onChange={(e) => setHero({ ...hero, sub2: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="border-t border-teal-subtle pt-6">
          <h2 className="font-display text-xl text-maroon">Home about block</h2>
          <div className="mt-4 space-y-5">
            <Field label="Small label">
              <input className={inputCls} value={about.eyebrow} onChange={(e) => setAbout({ ...about, eyebrow: e.target.value })} />
            </Field>
            <Field label="Title">
              <input className={inputCls} value={about.title} onChange={(e) => setAbout({ ...about, title: e.target.value })} />
            </Field>
            <Field label="Paragraph">
              <textarea className={inputCls} rows={6} value={about.body} onChange={(e) => setAbout({ ...about, body: e.target.value })} />
            </Field>
          </div>
        </section>

        <button type="submit" disabled={busy} className="rounded-full bg-maroon px-8 py-2.5 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 active:scale-95 disabled:opacity-60">
          {busy ? 'Saving…' : 'Save all'}
        </button>
      </form>
    </div>
  )
}
