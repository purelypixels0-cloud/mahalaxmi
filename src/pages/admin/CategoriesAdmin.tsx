import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ImageUpload, ListShell, RowActions, inputCls, slugify } from '../../components/admin/ui'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  description: string
  image_url: string
  featured: boolean
  sort_order: number
}

const empty: Omit<CategoryRow, 'id'> = {
  name: '', slug: '', description: '', image_url: '', featured: false, sort_order: 0,
}

export default function CategoriesAdmin() {
  const [rows, setRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<CategoryRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRows(await cmsList<CategoryRow>('categories'))
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
      const payload = { ...editing, slug: editing.slug || slugify(editing.name), sort_order: Number(editing.sort_order) || 0 }
      if (editing.id) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('categories').insert(payload)
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
    if (!supabase || !window.confirm(`Delete category "${name}"? Products in it will become uncategorised.`)) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit category' : 'New category'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save category">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="Necklaces" />
        </Field>
        <Field label="URL slug (auto from name)">
          <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="necklaces" />
        </Field>
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description shown on cards" />
        </Field>
        <Field label="Photo">
          <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="categories" />
        </Field>
        <div className="flex gap-6">
          <Field label="Display order">
            <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </Field>
          <label className="flex items-end gap-2 pb-3 font-body text-sm text-teal-deep">
            <input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4 accent-[#481832]" />
            Featured on home page
          </label>
        </div>
      </FormShell>
    )
  }

  return (
    <ListShell title="Categories" sub="Catalogue categories. Featured ones appear large on the home page." onNew={() => setEditing({ ...empty })} newLabel="+ New category">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No categories yet — create the first one.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory-light font-display text-lg text-maroon/40">
                  {c.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-teal-deep">
                  {c.name}
                  {c.featured && <span className="ml-2 rounded-full bg-maroon/10 px-2 py-0.5 align-middle font-body text-[11px] font-medium text-maroon">Featured</span>}
                </p>
                <p className="truncate font-body text-xs text-ink-muted">/{c.slug} · order {c.sort_order}</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...c })} onDelete={() => remove(c.id, c.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
