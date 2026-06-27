'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Task, CreateTaskInput, UpdateTaskInput, Column } from '@/lib/types'

interface UseTasksReturn {
  tasks: Task[]
  archivedTasks: Task[]
  loading: boolean
  error: string | null
  createTask: (data: CreateTaskInput) => Promise<Task | null>
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, column: Column, position: number) => Promise<void>
  archiveTask: (id: string) => Promise<void>
  unarchiveTask: (id: string) => Promise<void>
}

export function useTasks(projectId: string): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([])
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [activeRes, archivedRes] = await Promise.all([
        fetch(`/api/tasks?projectId=${projectId}`),
        fetch(`/api/tasks?projectId=${projectId}&includeArchived=true`),
      ])
      if (!activeRes.ok || !archivedRes.ok) throw new Error('Failed to load tasks')
      const all: Task[] = await archivedRes.json()
      const active = all.filter((t) => !t.archived_at)
      const archived = all.filter((t) => !!t.archived_at)
      setTasks(active)
      setArchivedTasks(archived)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const createTask = async (data: CreateTaskInput): Promise<Task | null> => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return null
    const task: Task = await res.json()
    setTasks((prev) => [...prev, task])
    return task
  }

  const updateTask = async (id: string, data: UpdateTaskInput) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) return
    const updated: Task = await res.json()
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)))
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setArchivedTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const moveTask = async (id: string, column: Column, position: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column, position } : t)))
    await fetch(`/api/tasks/${id}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column, position }),
    })
  }

  const archiveTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/archive`, { method: 'PATCH' })
    if (!res.ok) return
    const updated: Task = await res.json()
    setTasks((prev) => prev.filter((t) => t.id !== id))
    setArchivedTasks((prev) => [...prev, updated])
  }

  const unarchiveTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}/unarchive`, { method: 'PATCH' })
    if (!res.ok) return
    const updated: Task = await res.json()
    setArchivedTasks((prev) => prev.filter((t) => t.id !== id))
    setTasks((prev) => [...prev, updated])
  }

  return { tasks, archivedTasks, loading, error, createTask, updateTask, deleteTask, moveTask, archiveTask, unarchiveTask }
}
