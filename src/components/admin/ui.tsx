import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block font-body text-xs font-medium text-teal-deep">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-teal-subtle bg-white px-4 py-2.5 text-sm text-teal-deep outline-none transition-colors placeholder:text-teal-dark/30 focus:border-maroon'

export function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

export function arrayToLines(arr: unknown): string {
  return Array.isArray(arr) ? arr.map(String).join('\n') : ''
}

export function ImageUpload({ value, onChange, folder }: { value: string; onChange: (url: string) => void; folder: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const upload = async (file: File) => {
    if (!supabase) return
    setBusy(true)
    setError('')
    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const path = `${folder}/${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('site-images').upload(path, file, { upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('site-images').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
    setBusy(false)
  }

  return (
    <div>
      {value ? (
        <div className="flex items-start gap-4">
          <img src={value} alt="preview" className="h-24 w-24 rounded-xl border border-teal-subtle object-cover" />
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-full border border-teal-subtle px-4 py-1.5 text-center font-body text-xs text-teal-deep transition-colors hover:border-maroon hover:text-maroon">
              {busy ? 'Uploading…' : 'Replace image'}
              <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
            </label>
            <button type="button" onClick={() => onChange('')} className="rounded-full px-4 py-1.5 font-body text-xs text-red-600 transition-colors hover:bg-red-50">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-subtle bg-ivory-light px-6 py-8 text-center transition-colors hover:border-maroon/40">
          <span className="font-body text-sm text-teal-deep">{busy ? 'Uploading…' : 'Click to upload an image'}</span>
          <span className="font-body text-xs text-ink-muted">JPG or PNG, max ~5MB</span>
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
        </label>
      )}
      {error && <p className="mt-2 font-body text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function MultiImageUpload({ value, onChange, folder }: { value: string[]; onChange: (urls: string[]) => void; folder: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const imgs = Array.isArray(value) ? value.filter(Boolean) : []

  const upload = async (files: FileList | null) => {
    if (!supabase || !files || files.length === 0) return
    setBusy(true)
    setError('')
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
        const path = `${folder}/${crypto.randomUUID()}.${ext}`
        const { error } = await supabase.storage.from('site-images').upload(path, file, { upsert: false })
        if (error) throw error
        const { data } = supabase.storage.from('site-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      onChange([...imgs, ...urls])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
    setBusy(false)
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    const next = [...imgs]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      {imgs.length > 0 && (
        <div className="mb-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {imgs.map((url, i) => (
            <div key={url + i} className="group relative overflow-hidden rounded-xl border border-teal-subtle">
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-maroon px-2 py-0.5 font-body text-[10px] font-medium text-ivory">Cover</span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/55 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="px-1.5 font-body text-sm text-white disabled:opacity-30" aria-label="Move left">‹</button>
                <button type="button" onClick={() => onChange(imgs.filter((_, k) => k !== i))} className="px-1.5 font-body text-xs text-white hover:text-red-300">Remove</button>
                <button type="button" disabled={i === imgs.length - 1} onClick={() => move(i, 1)} className="px-1.5 font-body text-sm text-white disabled:opacity-30" aria-label="Move right">›</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-teal-subtle bg-ivory-light px-6 py-6 text-center transition-colors hover:border-maroon/40">
        <span className="font-body text-sm text-teal-deep">{busy ? 'Uploading…' : imgs.length ? 'Add more photos' : 'Click to upload photos'}</span>
        <span className="font-body text-xs text-ink-muted">JPG or PNG, you can select several at once · first photo is the cover</span>
        <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = '' }} />
      </label>
      {error && <p className="mt-2 font-body text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function ListShell({ title, sub, onNew, newLabel, children }: {  title: string; sub: string; onNew: () => void; newLabel: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-teal-deep">{title}</h1>
          <p className="mt-1 font-body text-sm text-ink-muted">{sub}</p>
        </div>
        <button onClick={onNew} className="rounded-full bg-maroon px-6 py-2.5 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 active:scale-95">
          {newLabel}
        </button>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  )
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button onClick={onEdit} className="rounded-full border border-teal-subtle px-4 py-1.5 font-body text-xs text-teal-deep transition-colors hover:border-maroon hover:text-maroon">
        Edit
      </button>
      <button onClick={onDelete} className="rounded-full border border-teal-subtle px-4 py-1.5 font-body text-xs text-red-600 transition-colors hover:border-red-300 hover:bg-red-50">
        Delete
      </button>
    </div>
  )
}

export function FormShell({ title, onCancel, onSubmit, busy, submitLabel, children }: {
  title: string; onCancel: () => void; onSubmit: (e: React.FormEvent) => void; busy: boolean; submitLabel: string; children: React.ReactNode
}) {
  return (
    <div>
      <button onClick={onCancel} className="font-body text-sm text-maroon hover:underline">← Back to list</button>
      <h1 className="mt-2 font-display text-3xl text-teal-deep">{title}</h1>
      <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-5 rounded-[20px] border border-teal-subtle bg-white p-6 shadow-card md:p-8">
        {children}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="rounded-full bg-maroon px-8 py-2.5 font-body text-sm font-medium text-ivory transition-all hover:bg-maroon/90 active:scale-95 disabled:opacity-60">
            {busy ? 'Saving…' : submitLabel}
          </button>
          <button type="button" onClick={onCancel} className="rounded-full border border-teal-subtle px-8 py-2.5 font-body text-sm text-teal-deep transition-colors hover:border-maroon hover:text-maroon">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
