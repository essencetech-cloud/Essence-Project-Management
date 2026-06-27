'use client'

import Avatar from '@/components/ui/Avatar'
import { formatRelative } from '@/lib/utils'
import type { ActivityLogEntry } from '@/lib/types'

const ACTION_LABELS: Record<string, string> = {
  'task.created':   'created task',
  'task.updated':   'updated task',
  'task.deleted':   'deleted task',
  'task.archived':  'archived task',
  'task.unarchived': 'unarchived task',
  'doc.created':    'created doc',
  'doc.updated':    'updated doc',
  'doc.deleted':    'deleted doc',
  'member.added':   'added a member',
  'member.removed': 'removed a member',
  'member.role_changed': 'changed a member\'s role',
}

interface ActivityItemProps {
  entry: ActivityLogEntry
}

export default function ActivityItem({ entry }: ActivityItemProps) {
  const label = ACTION_LABELS[entry.action] ?? entry.action

  return (
    <div className="flex items-start gap-3 py-3">
      <Avatar name={entry.user.full_name} color={entry.user.avatar_color} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{entry.user.full_name}</span>
          {' '}
          <span className="text-gray-500">{label}</span>
          {entry.entity_name && (
            <>
              {' '}
              <span className="font-medium text-gray-700">&ldquo;{entry.entity_name}&rdquo;</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatRelative(entry.created_at)}</p>
      </div>
    </div>
  )
}
