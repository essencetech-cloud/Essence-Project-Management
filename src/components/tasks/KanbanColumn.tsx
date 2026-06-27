'use client'

import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COLUMN_CONFIG } from '@/lib/constants'
import TaskCard from './TaskCard'
import type { Task, Column, Profile } from '@/lib/types'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  members: Profile[]
  canAddTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
  onAddTask: (column: Column) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onArchiveTask?: (task: Task) => void
}

export default function KanbanColumn({
  column,
  tasks,
  canAddTask,
  canEditTask,
  canDeleteTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onArchiveTask,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[column]

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', config.dotColor)} />
          <span className={cn('text-xs font-semibold uppercase tracking-wide', config.headerColor)}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 leading-none">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 flex flex-col gap-2 min-h-[400px] rounded-xl p-2 transition-all duration-150',
              snapshot.isDraggingOver ? 'bg-indigo-50/50' : 'bg-gray-50/50'
            )}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-gray-300 text-center px-4">No tasks yet</p>
              </div>
            )}

            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                canEdit={canEditTask}
                canDelete={canDeleteTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onArchive={onArchiveTask}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Add task button */}
      {canAddTask && (
        <button
          onClick={() => onAddTask(column)}
          className="flex items-center gap-1.5 px-3 py-2 mt-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-150 w-full"
        >
          <Plus className="h-3.5 w-3.5" />
          Add task
        </button>
      )}
    </div>
  )
}
