'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Attachment } from '@/lib/types'

export function useAttachments(taskId: string | null, docId?: string | null) {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const id = taskId ?? docId
    if (!id) { setAttachments([]); return }
    const param = taskId ? `task_id=${taskId}` : `doc_id=${docId}`
    setLoading(true)
    fetch(`/api/attachments?${param}`)
      .then((r) => r.json())
      .then((data) => { setAttachments(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [taskId, docId])

  const upload = useCallback(async (file: File): Promise<Attachment | null> => {
    const form = new FormData()
    form.append('file', file)
    if (taskId) form.append('task_id', taskId)
    if (docId) form.append('doc_id', docId)

    const res = await fetch('/api/attachments', { method: 'POST', body: form })
    if (!res.ok) return null
    const attachment: Attachment = await res.json()
    setAttachments((prev) => [...prev, attachment])
    return attachment
  }, [taskId, docId])

  const remove = useCallback(async (id: string): Promise<void> => {
    await fetch(`/api/attachments/${id}`, { method: 'DELETE' })
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { attachments, loading, upload, remove }
}
