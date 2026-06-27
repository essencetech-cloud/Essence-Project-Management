'use client'

import { useState } from 'react'
import { Pencil, Trash2, Archive } from 'lucide-react'
import { Draggable } from '@hello-pangea/dnd'
import { cn, formatDate } from '@/lib/utils'
import { TAG_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { getDueDateStatus, dueDateClasses } from '@/lib/getDueDateStatus'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  index: number
  canEdit: boolean
  canDelete: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onArchive?: (task: Task) => void
}

export default function TaskCard({ task, index, canEdit, canDelete, onEdit, onDelete, onArchive }: TaskCardProps) {
  const [hovered, setHovered] = useState(false)
  const tagCfg = TAG_CONFIG[task.tag]
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const dueDateStatus = getDueDateStatus(task.due_date, task.column)

  const showActions = hovered && (canEdit || canDelete)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            'group bg-white border border-gray-100 rounded-lg p-3 cursor-pointer',
            'transition-all duration-150',
            snapshot.isDragging
              ? 'shadow-lg rotate-1 border-indigo-200'
              : 'hover:border-gray-200 hover:shadow-sm'
          )}
        >
          <div className="relative">
            {/* Actions */}
            {showActions && !snapshot.isDragging && (
              <div className="absolute -top-1 -right-1 flex items-center gap-0.5 z-10">
                {canEdit && onArchive && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onArchive(task) }}
                    className="p-1 rounded-md bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all duration-150"
                    aria-label="Archive task"
                  >
                    <Archive className="h-3 w-3" />
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(task) }}
                    className="p-1 rounded-md bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150"
                    aria-label="Edit task"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(task) }}
                    className="p-1 rounded-md bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Tag */}
            <Badge className={cn(tagCfg.bg, tagCfg.text, 'mb-2')}>
              {tagCfg.label}
            </Badge>

            {/* Title */}
            <p
              className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 cursor-pointer"
              onClick={() => canEdit && onEdit(task)}
            >
              {task.title}
            </p>

            {/* Description preview */}
            {task.description && (
              <p className="text-xs text-gray-400 line-clamp-1 mb-2">{task.description}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {task.assignee ? (
                  <Avatar name={task.assignee.full_name} color={task.assignee.avatar_color} size="xs" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-gray-100 border border-dashed border-gray-300" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full flex-shrink-0', priorityCfg.dot)} title={priorityCfg.label} />
                {task.due_date && (
                  <span className={cn('text-xs', dueDateClasses(dueDateStatus))}>
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}
