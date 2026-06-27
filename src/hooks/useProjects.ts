'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Project } from '@/lib/types'

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  createProject: (data: { name: string; description?: string; color: string }) => Promise<Project | null>
  updateProject: (id: string, data: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  refresh: () => void
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Failed to load projects')
      const data = await res.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = async (data: { name: string; description?: string; color: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const project = await res.json()
    setProjects((prev) => [project, ...prev])
    return project as Project
  }

  const updateProject = async (id: string, data: Partial<Pick<Project, 'name' | 'description' | 'color'>>) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return
    const updated = await res.json()
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)))
  }

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  return { projects, loading, error, createProject, updateProject, deleteProject, refresh: fetchProjects }
}
