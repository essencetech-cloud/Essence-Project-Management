'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProjectMember } from '@/lib/types'

interface UseMembersReturn {
  members: ProjectMember[]
  loading: boolean
  error: string | null
}

export function useMembers(projectId: string): UseMembersReturn {
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      if (!res.ok) throw new Error('Failed to load members')
      const data = await res.json()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return { members, loading, error }
}
