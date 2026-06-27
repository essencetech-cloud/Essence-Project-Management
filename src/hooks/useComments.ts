'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Comment } from '@/lib/types'

export function useComments(taskId: string | null) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!taskId) { setComments([]); return }
    setLoading(true)
    fetch(`/api/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then((data) => { setComments(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [taskId])

  const addComment = useCallback(async (body: string): Promise<Comment | null> => {
    if (!taskId) return null
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) return null
    const comment: Comment = await res.json()
    setComments((prev) => [...prev, comment])
    return comment
  }, [taskId])

  const editComment = useCallback(async (commentId: string, body: string): Promise<void> => {
    if (!taskId) return
    const res = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) return
    const updated: Comment = await res.json()
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
  }, [taskId])

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    if (!taskId) return
    await fetch(`/api/tasks/${taskId}/comments/${commentId}`, { method: 'DELETE' })
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }, [taskId])

  return { comments, loading, addComment, editComment, deleteComment }
}
