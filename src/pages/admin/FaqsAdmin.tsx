import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Field, FormShell, ListShell, RowActions, inputCls } from '../../components/admin/ui'

export interface FaqRow {
  id: string
  section: string
  question: string
  answer: string
  sort_order: number
}

const empty: Omit<FaqRow, 'id'> = { section: 'home', question: '', answer: '', sort_order: 0 }

export default function FaqsAdmin() {
  const [rows, setRows] = useState<FaqRow[]>([])
  const [filter, setFilter] = useState<'all' | 'home' | 'schemes'>('all')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<FaqRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      if (!supabase) return
      const { data, error } = await supabase.from('faqs').select('*').order('section').order('sort_order').order('created_at')
      if (error) throw error
      setRows((data ?? []) as FaqRow[])
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
      const payload = { ...editing, sort_order: Number(editing.sort_order) || 0 }
      if (editing.id) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('faqs').insert(payload)
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setBusy(false)
  }

  const remove = async (id: string) => {
    if (!supabase || !window.confirm('Delete this question?')) return
    const { error } = await supabase.from('faqs').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  const visible = filter === 'all' ? rows : rows.filter((r) => r.section === filter)

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit question' : 'New question'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Shows on">
          <select className={inputCls} value={editing.section} onChange={(e) => setEditing({ ...editing, section: e.target.value })}>
            <option value="home">Home page FAQ</option>
            <option value="schemes">Schemes page FAQ</option>
          </select>
        </Field>
        <Field label="Question">
          <input className={inputCls} required value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="Question" />
        </Field>
        <Field label="Answer">
          <textarea className={inputCls} rows={5} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} placeholder="Answer" />
        </Field>
        <Field label="Display order">
          <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
        </Field>
      </FormShell>
    )
  }

  return (
    <ListShell title="FAQs" sub="Home page and Schemes page questions." onNew={() => setEditing({ ...empty, section: filter === 'all' ? 'home' : filter })} newLabel="+ New question">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      <div className="mb-4 flex gap-2">
        {(['all', 'home', 'schemes'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${filter === f ? 'bg-maroon text-ivory' : 'bg-teal-subtle text-teal-dark/70 hover:bg-maroon/10'}`}>
            {f === 'all' ? 'All' : f === 'home' ? 'Home' : 'Schemes'}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No questions here yet.</p>
      ) : (
        <div className="space-y-3">
          {visible.map((f) => (
            <div key={f.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              <div className="min-w-0 flex-1">
                <p className="truncate font-body text-sm font-medium text-teal-deep">{f.question}</p>
                <p className="truncate font-body text-xs text-ink-muted">{f.section === 'home' ? 'Home' : 'Schemes'} · order {f.sort_order}</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...f })} onDelete={() => remove(f.id)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
