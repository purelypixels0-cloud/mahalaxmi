import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ListShell, RowActions, arrayToLines, inputCls, linesToArray } from '../../components/admin/ui'

export interface SchemeRow {
  id: string
  name: string
  tagline: string
  duration_months: number
  bonus_percentage: number
  min_installment: number
  benefits: string[]
  terms: string[]
  sort_order: number
}

const empty: Omit<SchemeRow, 'id'> = {
  name: '', tagline: '', duration_months: 12, bonus_percentage: 0,
  min_installment: 1000, benefits: [], terms: [], sort_order: 0,
}

export default function SchemesAdmin() {
  const [rows, setRows] = useState<SchemeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<SchemeRow, 'id'> & { id?: string }) | null>(null)
  const [benefitsText, setBenefitsText] = useState('')
  const [termsText, setTermsText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRows(await cmsList<SchemeRow>('schemes'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startEdit = (s: SchemeRow) => {
    setEditing({ ...s })
    setBenefitsText(arrayToLines(s.benefits))
    setTermsText(arrayToLines(s.terms))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !editing) return
    setBusy(true)
    setError('')
    try {
      const payload = {
        ...editing,
        duration_months: Number(editing.duration_months) || 0,
        bonus_percentage: Number(editing.bonus_percentage) || 0,
        min_installment: Number(editing.min_installment) || 0,
        sort_order: Number(editing.sort_order) || 0,
        benefits: linesToArray(benefitsText),
        terms: linesToArray(termsText),
      }
      if (editing.id) {
        const { error } = await supabase.from('schemes').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('schemes').insert(payload)
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
    if (!supabase || !window.confirm(`Delete scheme "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('schemes').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit scheme' : 'New scheme'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save scheme">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Scheme name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Suvarna Sanchay" />
        </Field>
        <Field label="Tagline">
          <input className={inputCls} value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="Start small, shine big…" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Duration (months)">
            <input type="number" min={1} className={inputCls} value={editing.duration_months} onChange={(e) => setEditing({ ...editing, duration_months: Number(e.target.value) })} />
          </Field>
          <Field label="Bonus %">
            <input type="number" min={0} className={inputCls} value={editing.bonus_percentage} onChange={(e) => setEditing({ ...editing, bonus_percentage: Number(e.target.value) })} />
          </Field>
          <Field label="Min. monthly (₹)">
            <input type="number" min={0} className={inputCls} value={editing.min_installment} onChange={(e) => setEditing({ ...editing, min_installment: Number(e.target.value) })} />
          </Field>
        </div>
        <Field label="Benefits (one per line)">
          <textarea className={inputCls} rows={5} value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} />
        </Field>
        <Field label="Terms & conditions (one per line)">
          <textarea className={inputCls} rows={5} value={termsText} onChange={(e) => setTermsText(e.target.value)} />
        </Field>
        <Field label="Display order">
          <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
        </Field>
      </FormShell>
    )
  }

  return (
    <ListShell title="Schemes" sub="Gold savings plans with calculator figures, benefits and terms." onNew={() => { setEditing({ ...empty }); setBenefitsText(''); setTermsText('') }} newLabel="+ New scheme">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No schemes yet — or use the import button on the dashboard.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((s) => (
            <div key={s.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-maroon">
                <span className="font-display text-lg leading-none text-tan">{s.bonus_percentage}%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-teal-deep">{s.name}</p>
                <p className="truncate font-body text-xs text-ink-muted">{s.duration_months} months · min ₹{Number(s.min_installment).toLocaleString('en-IN')}/mo</p>
              </div>
              <RowActions onEdit={() => startEdit(s)} onDelete={() => remove(s.id, s.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
