'use client'

import { FileText } from 'lucide-react'
import DocCard from './DocCard'
import EmptyState from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Doc } from '@/lib/types'

interface DocListProps {
  docs: Doc[]
  projectId: string
  loading: boolean
}

export default function DocList({ docs, projectId, loading }: DocListProps) {
  if (loading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (docs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No documents yet"
        description="Create your first doc to start building your project knowledge base."
      />
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {docs.map((doc) => (
        <DocCard key={doc.id} doc={doc} projectId={projectId} />
      ))}
    </div>
  )
}
