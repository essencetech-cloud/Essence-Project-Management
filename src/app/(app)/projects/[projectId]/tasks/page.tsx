'use client'

import { use } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useMembers } from '@/hooks/useMembers'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import KanbanBoard from '@/components/tasks/KanbanBoard'
import { SkeletonTaskCard } from '@/components/ui/Skeleton'
import type { Profile } from '@/lib/types'

interface Props {
  params: Promise<{ projectId: string }>
}

export default function TasksPage({ params }: Props) {
  const { projectId } = use(params)
  const { tasks, archivedTasks, loading, createTask, updateTask, deleteTask, moveTask, archiveTask, unarchiveTask } = useTasks(projectId)
  const { members } = useMembers(projectId)
  const { can } = useProjectPermissions(projectId)

  const memberProfiles: Profile[] = members
    .map((m) => m.profile)
    .filter((p): p is Profile => p !== undefined)

  if (loading) {
    return (
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-72 space-y-2">
              <div className="h-5 w-24 bg-gray-100 rounded animate-pulse mb-3" />
              {Array.from({ length: 3 }).map((_, j) => (
                <SkeletonTaskCard key={j} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <KanbanBoard
      projectId={projectId}
      tasks={tasks}
      archivedTasks={archivedTasks}
      members={memberProfiles}
      canCreateTask={can('create_task')}
      canEditTask={can('edit_task')}
      canDeleteTask={can('delete_task')}
      onCreateTask={createTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onMoveTask={moveTask}
      onArchiveTask={archiveTask}
      onUnarchiveTask={unarchiveTask}
    />
  )
}
