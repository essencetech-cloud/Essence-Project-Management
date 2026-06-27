'use client'

import { useEffect, useState } from 'react'
import ActivityItem from './ActivityItem'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ActivityLogEntry } from '@/lib/types'

interface ActivityFeedProps {
  projectId: string
}

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/activity`)
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-3 py-3">
            <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No activity yet.</p>
  }

  return (
    <div className="divide-y divide-gray-50">
      {entries.map((entry) => (
        <ActivityItem key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
