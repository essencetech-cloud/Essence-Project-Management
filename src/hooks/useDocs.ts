'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Doc } from '@/lib/types'

interface UseDocsReturn {
  docs: Doc[]
  loading: boolean
  error: string | null
  createDoc: (projectId: string, title?: string) => Promise<Doc | null>
  deleteDoc: (id: string) => Promise<void>
}

export function useDocs(projectId: string): UseDocsReturn {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/docs?projectId=${projectId}`)
      if (!res.ok) throw new Error('Failed to load docs')
      const data = await res.json()
      setDocs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const createDoc = async (pId: string, title?: string): Promise<Doc | null> => {
    const res = await fetch('/api/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: pId, title }),
    })
    if (!res.ok) return null
    const doc = await res.json()
    setDocs((prev) => [doc, ...prev])
    return doc as Doc
  }

  const deleteDoc = async (id: string) => {
    await fetch(`/api/docs/${id}`, { method: 'DELETE' })
    setDocs((prev) => prev.filter((d) => d.id !== id))
  }

  return { docs, loading, error, createDoc, deleteDoc }
}
