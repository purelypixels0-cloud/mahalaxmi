import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { cmsList } from '../../lib/content'
import { Field, FormShell, ListShell, MultiImageUpload, RowActions, arrayToLines, inputCls, linesToArray, slugify } from '../../components/admin/ui'
import type { CategoryRow } from './CategoriesAdmin'

export interface ProductRow {
  id: string
  name: string
  slug: string
  category_id: string | null
  price: number
  weight: string
  purity: string
  making_charge: string
  description: string
  details: string[]
  image_url: string
  images: string[]
  is_featured: boolean
  sort_order: number
}

const empty: Omit<ProductRow, 'id'> = {
  name: '', slug: '', category_id: null, price: 0, weight: '', purity: '',
  making_charge: '', description: '', details: [], image_url: '', images: [], is_featured: false, sort_order: 0,
}

export default function ProductsAdmin() {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [cats, setCats] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<(Omit<ProductRow, 'id'> & { id?: string }) | null>(null)
  const [detailsText, setDetailsText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([cmsList<ProductRow>('products'), cmsList<CategoryRow>('categories')])
      setRows(p)
      setCats(c)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startNew = () => {
    setEditing({ ...empty })
    setDetailsText('')
  }

  const startEdit = (p: ProductRow) => {
    const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : p.image_url ? [p.image_url] : []
    setEditing({ ...p, images: imgs })
    setDetailsText(arrayToLines(p.details))
  }

  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name ?? '—'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || !editing) return
    setBusy(true)
    setError('')
    try {
      const payload = {
        ...editing,
        slug: editing.slug || slugify(editing.name),
        price: Number(editing.price) || 0,
        sort_order: Number(editing.sort_order) || 0,
        category_id: editing.category_id || null,
        details: linesToArray(detailsText),
        images: editing.images,
        image_url: editing.images[0] ?? '',
      }
      if (editing.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert(payload)
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
    if (!supabase || !window.confirm(`Delete product "${name}"? This cannot be undone.`)) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) setError(error.message)
    else await load()
  }

  if (editing) {
    return (
      <FormShell title={editing.id ? 'Edit product' : 'New product'} onCancel={() => setEditing(null)} onSubmit={submit} busy={busy} submitLabel="Save product">
        {error && <p className="font-body text-xs text-red-600">{error}</p>}
        <Field label="Product name">
          <input className={inputCls} required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="Tarakasi Necklace" />
        </Field>
        <Field label="URL slug (auto from name)">
          <input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} placeholder="tarakasi-necklace" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Category">
            <select className={inputCls} value={editing.category_id ?? ''} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })}>
              <option value="">Uncategorised</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Price (₹)">
            <input type="number" min={0} className={inputCls} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Weight">
            <input className={inputCls} value={editing.weight} onChange={(e) => setEditing({ ...editing, weight: e.target.value })} placeholder="32.5 g" />
          </Field>
          <Field label="Purity">
            <input className={inputCls} value={editing.purity} onChange={(e) => setEditing({ ...editing, purity: e.target.value })} placeholder="22K (916)" />
          </Field>
          <Field label="Making charge">
            <input className={inputCls} value={editing.making_charge} onChange={(e) => setEditing({ ...editing, making_charge: e.target.value })} placeholder="14%" />
          </Field>
        </div>
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Short description for the product page" />
        </Field>
        <Field label="Key features (one per line)">
          <textarea className={inputCls} rows={4} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} placeholder={'Handcrafted by master artisans\nLightweight for daily wear'} />
        </Field>
        <Field label="Photos (first = cover)">
          <MultiImageUpload value={editing.images} onChange={(urls) => setEditing({ ...editing, images: urls })} folder="products" />
        </Field>
        <div className="flex gap-6">
          <Field label="Display order">
            <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </Field>
          <label className="flex items-end gap-2 pb-3 font-body text-sm text-teal-deep">
            <input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="h-4 w-4 accent-[#481832]" />
            Featured product
          </label>
        </div>
      </FormShell>
    )
  }

  return (
    <ListShell title="Products" sub="Catalogue items. New products appear in the catalogue instantly." onNew={startNew} newLabel="+ New product">
      {error && <p className="mb-4 font-body text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="font-body text-sm text-ink-muted">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">No products yet — create the first one, or use the import button (Phase 4) to copy the current site content.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-[16px] border border-teal-subtle bg-white p-4 shadow-card">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-ivory-light font-display text-lg text-maroon/40">
                  {p.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg text-teal-deep">
                  {p.name}
                  {p.is_featured && <span className="ml-2 rounded-full bg-maroon/10 px-2 py-0.5 align-middle font-body text-[11px] font-medium text-maroon">Featured</span>}
                </p>
                <p className="truncate font-body text-xs text-ink-muted">
                  {catName(p.category_id)} · ₹{Number(p.price).toLocaleString('en-IN')}
                </p>
              </div>
              <RowActions onEdit={() => startEdit(p)} onDelete={() => remove(p.id, p.name)} />
            </div>
          ))}
        </div>
      )}
    </ListShell>
  )
}
