import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ImageUpload, ListShell, RowActions, inputCls } from '../../components/admin/ui'

export interface TeamRow {
  id: string
  name: string
  role: string
  era: string
  image_url: string
  sort_order: number
}

const empty: Omit<TeamRow, 'id'> = { name: '', role: '', era: '', image_url: '', sort_order: 0 }

export default function TeamAdmin() {
  const [rows, setRows] = useState<TeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<TeamRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRows(await cmsList<TeamRow>('team_members'))
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
        const { error } = await supabase.from('team_members').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('team_members').insert(payload)
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
    if (!supabase || !window.confirm(`Remove "${name}" from the team?`)) return
    const { error } = await supabase.from('team_members').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit team member' : 'New team member'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Full name" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Role">
            <input className={inputCls} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} placeholder="Founder" />
          </Field>
          <Field label="Since (year)">
            <input className={inputCls} value={editing.era} onChange={(e) => setEditing({ ...editing, era: e.target.value })} placeholder="1986" />
          </Field>
        </div>
        <Field label="Photo">
          <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="team" />
        </Field>
        <Field label="Display order">
          <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
        </Field>
      </FormShell>
    )
  }

  return (
    <ListShell title="Team" sub="People cards on the About page." onNew={() => setEditing({ ...empty })} newLabel="+ Add member">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No members yet — or use the import button on the dashboard.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              {m.image_url ? (
                <img src={m.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory-light font-display text-lg text-maroon/40">
                  {m.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-teal-deep">{m.name}</p>
                <p className="truncate font-body text-xs text-ink-muted">{m.role}{m.era ? ` · since ${m.era}` : ''}</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...m })} onDelete={() => remove(m.id, m.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
