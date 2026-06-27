'use client'

import { use, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import DocEditor from '@/components/docs/DocEditor'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import type { Doc } from '@/lib/types'

interface Props {
  params: Promise<{ projectId: string; docId: string }>
}

export default function DocPage({ params }: Props) {
  const { projectId, docId } = use(params)
  const { can } = useProjectPermissions(projectId)
  const [doc, setDoc] = useState<Doc | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)

  useEffect(() => {
    const fetchDoc = async () => {
      const res = await fetch(`/api/docs/${docId}`)
      if (!res.ok) {
        setNotFoundState(true)
        setLoading(false)
        return
      }
      setDoc(await res.json())
      setLoading(false)
    }
    fetchDoc()
  }, [docId])

  const handleSave = async (data: { title?: string; content?: Record<string, unknown> }) => {
    await fetch(`/api/docs/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (data.title && doc) setDoc({ ...doc, title: data.title })
  }

  if (notFoundState) notFound()

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-32" />
        <div className="space-y-2 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    )
  }

  if (!doc) return null

  return <DocEditor doc={doc} readOnly={!can('edit_doc')} onSave={handleSave} />
}
