'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface SearchResults {
  tasks: Array<{ id: string; title: string; column: string; priority: string; tag: string; project_id: string; project: { id: string; name: string; color: string } }>
  docs: Array<{ id: string; title: string; project_id: string; project: { id: string; name: string; color: string } }>
  projects: Array<{ id: string; name: string; color: string }>
}

const EMPTY: SearchResults = { tasks: [], docs: [], projects: [] }

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults(EMPTY); setLoading(false); return }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
    if (res.ok) setResults(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) { setResults(EMPTY); setLoading(false); return }
    timerRef.current = setTimeout(() => search(query), 300)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, search])

  const clear = useCallback(() => { setQuery(''); setResults(EMPTY) }, [])

  const totalCount = results.tasks.length + results.docs.length + results.projects.length

  return { query, setQuery, results, loading, clear, totalCount }
}
