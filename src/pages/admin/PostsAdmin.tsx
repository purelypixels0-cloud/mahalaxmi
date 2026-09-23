import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Field, FormShell, ImageUpload, ListShell, RowActions, inputCls, slugify } from '../../components/admin/ui'

export interface PostRow {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  author: string
  read_time: string
  publish_date: string | null
  image_url: string
  published: boolean
}

const empty: Omit<PostRow, 'id'> = {
  title: '', slug: '', excerpt: '', content: '', category: '',
  author: '', read_time: '', publish_date: null, image_url: '', published: true,
}

export default function PostsAdmin() {
  const [rows, setRows] = useState<PostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<PostRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      if (!supabase) return
      const { data, error } = await supabase.from('posts').select('*').order('publish_date', { ascending: false }).order('created_at', { ascending: false })
      if (error) throw error
      setRows((data ?? []) as PostRow[])
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
      const payload = {
        ...editing,
        slug: editing.slug || slugify(editing.title),
        publish_date: editing.publish_date || null,
      }
      if (editing.id) {
        const { error } = await supabase.from('posts').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('posts').insert(payload)
        if (error) throw error
      }
      setEditing(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setBusy(false)
  }

  const remove = async (id: string, title: string) => {
    if (!supabase || !window.confirm(`Delete article "${title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit article' : 'New article'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save article">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Title">
          <input className={inputCls} required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="Article title" />
        </Field>
        <Field label="URL slug (auto from title)">
          <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <input className={inputCls} value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="Guide" />
          </Field>
          <Field label="Author">
            <input className={inputCls} value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} placeholder="Author name" />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Read time">
            <input className={inputCls} value={editing.read_time} onChange={(e) => setEditing({ ...editing, read_time: e.target.value })} placeholder="5 min read" />
          </Field>
          <Field label="Publish date">
            <input type="date" className={inputCls} value={editing.publish_date ?? ''} onChange={(e) => setEditing({ ...editing, publish_date: e.target.value || null })} />
          </Field>
        </div>
        <Field label="Excerpt (shows on cards)">
          <textarea className={inputCls} rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
        </Field>
        <Field label="Article body (blank line = new paragraph)">
          <textarea className={inputCls} rows={10} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="First paragraph…&#10;&#10;Second paragraph…" />
        </Field>
        <Field label="Cover photo">
          <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="journal" />
        </Field>
        <label className="flex items-center gap-2 font-body text-sm text-teal-deep">
          <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="h-4 w-4 accent-[#481832]" />
          Published (uncheck to hide from the website)
        </label>
      </FormShell>
    )
  }

  return (
    <ListShell title="Journal" sub="Blog articles. Unpublished drafts stay hidden from the website." onNew={() => setEditing({ ...empty })} newLabel="+ New article">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No articles yet — or use the import button on the dashboard to copy the current ones.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory-light font-display text-lg text-maroon/40">
                  {p.title.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-teal-deep">
                  {p.title}
                  {!p.published && <span className="ml-2 rounded-full bg-teal-subtle px-2 py-0.5 align-middle font-body text-[11px] font-medium text-teal-dark/60">Draft</span>}
                </p>
                <p className="truncate font-body text-xs text-ink-muted">{p.category} · {p.publish_date ?? 'no date'}</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...p })} onDelete={() => remove(p.id, p.title)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
