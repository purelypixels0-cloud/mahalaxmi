import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ImageUpload, ListShell, RowActions, inputCls, slugify } from '../../components/admin/ui'

export interface CollectionRow {
  id: string
  name: string
  slug: string
  description: string
  story: string
  image_url: string
  pieces: number
  sort_order: number
}

export interface PieceRow {
  id: string
  collection_id: string
  name: string
  price: number
  image_url: string
  sort_order: number
}

const empty: Omit<CollectionRow, 'id'> = {
  name: '', slug: '', description: '', story: '', image_url: '', pieces: 0, sort_order: 0,
}

function PiecesManager({ collectionId }: { collectionId: string }) {
  const [pieces, setPieces] = useState<PieceRow[]>([])
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('collection_pieces').select('*').eq('collection_id', collectionId).order('sort_order').order('created_at')
    if (!error) setPieces((data ?? []) as PieceRow[])
  }

  useEffect(() => { load() }, [collectionId])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !name.trim()) return
    setBusy(true)
    setError('')
    const { error } = await supabase.from('collection_pieces').insert({
      collection_id: collectionId, name: name.trim(), price: Number(price) || 0,
      image_url: image, sort_order: pieces.length,
    })
    if (error) setError(error.message)
    else { setName(''); setPrice(''); setImage(''); await load() }
    setBusy(false)
  }

  const remove = async (id: string) => {
    if (!supabase || !window.confirm('Remove this piece?')) return
    const { error } = await supabase.from('collection_pieces').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  return (
    <div className="mt-8 border-t border-teal-subtle pt-6">
      <h3 className="font-display text-xl text-teal-deep">Pieces in this collection ({pieces.length})</h3>
      {error && <p className="mt-2 font-body text-xs text-red-600">{error}</p>}
      <div className="mt-4 space-y-2">
        {pieces.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-teal-subtle bg-ivory-light px-4 py-2.5">
            {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />}
            <span className="flex-1 truncate font-body text-sm text-teal-deep">{p.name}</span>
            <span className="font-body text-sm text-ink-muted">₹{Number(p.price).toLocaleString('en-IN')}</span>
            <button type="button" onClick={() => remove(p.id)} className="font-body text-xs text-red-600 hover:underline">Remove</button>
          </div>
        ))}
        {pieces.length === 0 && <p className="font-body text-sm text-ink-muted">No pieces yet.</p>}
      </div>
      <form onSubmit={add} className="mt-4 grid gap-3 rounded-xl bg-ivory-light p-4 sm:grid-cols-[1fr_140px_auto]">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Piece name" />
        <input type="number" min={0} className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ₹" />
        <button type="submit" disabled={busy} className="rounded-full bg-maroon px-6 py-2.5 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 disabled:opacity-60">
          {busy ? 'Adding…' : 'Add piece'}
        </button>
      </form>
      <div className="mt-3 max-w-xs">
        <ImageUpload value={image} onChange={setImage} folder="pieces" />
      </div>
    </div>
  )
}

export default function CollectionsAdmin() {
  const [rows, setRows] = useState<CollectionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<CollectionRow, 'id'> & { id?: string }) | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setRows(await cmsList<CollectionRow>('collections'))
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
      const payload = { ...editing, slug: editing.slug || slugify(editing.name), pieces: Number(editing.pieces) || 0, sort_order: Number(editing.sort_order) || 0 }
      if (editing.id) {
        const { error } = await supabase.from('collections').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('collections').insert(payload)
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
    if (!supabase || !window.confirm(`Delete collection "${name}" and all its pieces? This cannot be undone.`)) return
    const { error } = await supabase.from('collections').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing?.id) {
    return (
      <FormShell title="Edit collection" onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save collection">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
        </Field>
        <Field label="URL slug">
          <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
        </Field>
        <Field label="Short description">
          <textarea className={inputCls} rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        </Field>
        <Field label="Story (shows on the collection page)">
          <textarea className={inputCls} rows={5} value={editing.story} onChange={(e) => setEditing({ ...editing, story: e.target.value })} />
        </Field>
        <Field label="Cover photo">
          <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="collections" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Pieces count (display)">
            <input type="number" min={0} className={inputCls} value={editing.pieces} onChange={(e) => setEditing({ ...editing, pieces: Number(e.target.value) })} />
          </Field>
          <Field label="Display order">
            <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </Field>
        </div>
        <PiecesManager collectionId={editing.id} />
      </FormShell>
    )
  }

  if (editing) {
    return (
      <FormShell title="New collection" onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save collection">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: slugify(e.target.value) })} placeholder="Tarakasi" />
        </Field>
        <Field label="URL slug (auto from name)">
          <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
        </Field>
        <Field label="Short description">
          <textarea className={inputCls} rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
        </Field>
        <Field label="Story">
          <textarea className={inputCls} rows={5} value={editing.story} onChange={(e) => setEditing({ ...editing, story: e.target.value })} />
        </Field>
        <Field label="Cover photo">
          <ImageUpload value={editing.image_url} onChange={(url) => setEditing({ ...editing, image_url: url })} folder="collections" />
        </Field>
        <p className="font-body text-xs text-ink-muted">Save first — pieces can be added after.</p>
      </FormShell>
    )
  }

  return (
    <ListShell title="Collections" sub="Signature collections and the pieces inside them." onNew={() => setEditing({ ...empty })} newLabel="+ New collection">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No collections yet — or use the import button on the dashboard.</p>
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
                <p className="truncate font-display text-lg text-teal-deep">{c.name}</p>
                <p className="truncate font-body text-xs text-ink-muted">/{c.slug} · {c.pieces} pieces</p>
              </div>
              <RowActions onEdit={() => setEditing({ ...c })} onDelete={() => remove(c.id, c.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
