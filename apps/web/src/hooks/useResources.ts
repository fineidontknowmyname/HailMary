import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import type { Resource } from '../types'

const API = import.meta.env.VITE_API_BASE_URL

interface Filters {
  domain: string
  type: string
  lang: string
  search: string
}

export function useResources(filters: Filters) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (filters.domain !== 'all') params.set('domain', filters.domain)
    if (filters.type   !== 'all') params.set('type',   filters.type)
    if (filters.lang   !== 'all') params.set('lang',   filters.lang)

    fetch(`${API}/api/resources?${params}`)
      .then(r => { if (!r.ok) throw new Error('API error'); return r.json() })
      .then(d => { setResources(d.data ?? []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }, [filters.domain, filters.type, filters.lang])

  const fuse = useMemo(() => new Fuse(resources, {
    keys: ['title', 'description', 'tags', 'source', 'channel_name'],
    threshold: 0.35,
  }), [resources])

  const displayed = useMemo(() =>
    filters.search.trim()
      ? fuse.search(filters.search).map(r => r.item)
      : resources,
    [filters.search, fuse, resources]
  )

  return { displayed, loading, error, total: resources.length }
}