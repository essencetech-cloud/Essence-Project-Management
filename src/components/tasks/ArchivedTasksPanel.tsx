'use client'

import { X, ArchiveRestore, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { TAG_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import type { Task, Profile } from '@/lib/types'

interface ArchivedTasksPanelProps {
  tasks: Task[]
  members: Profile[]
  canEdit: boolean
  onUnarchive: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

export default function ArchivedTasksPanel({
  tasks,
  canEdit,
  onUnarchive,
  onDelete,
  onClose,
}: ArchivedTasksPanelProps) {
  return (
    <div className="border-b border-amber-200 bg-amber-50/50 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-amber-800">
          Archived tasks ({tasks.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-amber-600 hover:text-amber-800 hover:bg-amber-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-amber-600">No archived tasks.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {tasks.map((task) => {
            const tagCfg = TAG_CONFIG[task.tag]
            const priorityCfg = PRIORITY_CONFIG[task.priority]
            return (
              <div
                key={task.id}
                className="flex items-center gap-3 bg-white rounded-lg border border-amber-100 px-3 py-2"
              >
                <Badge className={cn(tagCfg.bg, tagCfg.text, 'flex-shrink-0 text-xs')}>
                  {tagCfg.label}
                </Badge>
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priorityCfg.dot)} />
                <p className="flex-1 text-sm font-medium text-gray-700 truncate">{task.title}</p>
                {task.assignee && (
                  <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size="xs" />
                )}
                {task.due_date && (
                  <span className="text-xs text-gray-400 hidden sm:block">{formatDate(task.due_date)}</span>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {canEdit && (
                    <button
                      onClick={() => onUnarchive(task.id)}
                      className="p-1.5 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                      aria-label="Restore task"
                      title="Restore"
                    >
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    aria-label="Delete task"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
