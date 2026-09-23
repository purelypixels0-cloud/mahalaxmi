import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ListShell, RowActions, inputCls } from '../../components/admin/ui'

export interface TestimonialRow {
  id: string
  name: string
  location: string
  text: string
  rating: number
  sort_order: number
}

const empty: Omit<TestimonialRow, 'id'> = { name: '', location: '', text: '', rating: 5, sort_order: 0 }

export default function TestimonialsAdmin() {
  const [rows, setRows] = useState<TestimonialRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<TestimonialRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRows(await cmsList<TestimonialRow>('testimonials'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !editing) return
    setBusy(true)
    setError('')
    try {
      const payload = { ...editing, rating: Math.min(5, Math.max(1, Number(editing.rating) || 5)), sort_order: Number(editing.sort_order) || 0 }
      if (editing.id) {
        const { error } = await supabase.from('testimonials').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('testimonials').insert(payload)
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setBusy(false)
  }

  const remove = async (id: string, name: string) => {
    if (!supabase || !window.confirm(`Delete testimonial from "${name}"?`)) return
    const { error } = await supabase.from('testimonials').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit testimonial' : 'New testimonial'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Customer name">
            <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Full name" />
          </Field>
          <Field label="Location">
            <input className={inputCls} value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="Balasore" />
          </Field>
        </div>
        <Field label="Review">
          <textarea className={inputCls} rows={4} required value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} placeholder="What did they say?" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Rating (1–5)">
            <select className={inputCls} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>
              ))}
            </select>
          </Field>
          <Field label="Display order">
            <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </Field>
        </div>
      </FormShell>
    )
  }

  return (
    <ListShell title="Testimonials" sub="Customer reviews shown on the home page." onNew={() => setEditing({ ...empty })} newLabel="+ New testimonial">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No testimonials yet — or use the import button on the dashboard.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-teal-deep">{t.name} <span className="font-normal text-ink-muted">· {t.location} · {'★'.repeat(t.rating)}</span></p>
                <p className="truncate font-body text-xs text-ink-muted">{t.text}</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...t })} onDelete={() => remove(t.id, t.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
