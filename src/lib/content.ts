import { useEffect, useState } from 'react'
import { supabase, isCmsEnabled } from './supabase'

export interface CmsState<T> {
  data: T
  live: boolean
  loading: boolean
}

/**
 * Fetch a Supabase table (ordered); fall back to bundled content when
 * the CMS is not configured or the request fails. `live` tells the UI
 * whether the rows came from the CMS.
 */
export function useCmsTable<T>(table: string, fallback: T, orderBy = 'sort_order'): CmsState<T> {
  const [state, setState] = useState<CmsState<T>>({ data: fallback, live: false, loading: isCmsEnabled })

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      try {
        let query = supabase.from(table).select('*')
        // not every table has sort_order (e.g. key-value stores order by key)
        if (table === 'homepage_content' || table === 'site_settings') {
          query = query.order('key')
        } else {
          query = query.order(orderBy).order('created_at')
        }
        const { data, error } = await query
        if (!cancelled && !error && data) {
          setState({ data: data as T, live: true, loading: false })
        } else if (!cancelled) {
          setState({ data: fallback, live: false, loading: false })
        }
      } catch {
        if (!cancelled) setState({ data: fallback, live: false, loading: false })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [table, fallback, orderBy])

  return state
}

/** One-shot fetch helper for admin screens (no fallback). */
export async function cmsList<T>(table: string, orderBy = 'sort_order'): Promise<T[]> {
  if (!supabase) return []
  const { data, error } = await supabase.from(table).select('*').order(orderBy).order('created_at')
  if (error) throw error
  return (data ?? []) as T[]
}

/** Key-value fetch (homepage_content / site_settings). Returns parsed value or fallback. */
export function useCmsKV<T>(table: 'homepage_content' | 'site_settings', key: string, fallback: T): CmsState<T> {
  const [state, setState] = useState<CmsState<T>>({ data: fallback, live: false, loading: isCmsEnabled })

  useEffect(() => {
    if (!supabase) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase.from(table).select('value').eq('key', key).maybeSingle()
        if (!cancelled && !error && data && (data as { value?: T }).value !== undefined) {
          setState({ data: (data as { value: T }).value, live: true, loading: false })
        } else if (!cancelled) {
          setState({ data: fallback, live: false, loading: false })
        }
      } catch {
        if (!cancelled) setState({ data: fallback, live: false, loading: false })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [table, key, fallback])

  return state
}
