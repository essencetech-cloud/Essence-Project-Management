'use client'

import { useState, useMemo } from 'react'
import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import TaskModal from './TaskModal'
import FilterBar from './FilterBar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ArchivedTasksPanel from './ArchivedTasksPanel'
import { COLUMNS } from '@/lib/constants'
import { positionBetween } from '@/lib/utils'
import type { Task, Column, Profile, Filters } from '@/lib/types'

interface KanbanBoardProps {
  projectId: string
  tasks: Task[]
  archivedTasks: Task[]
  members: Profile[]
  canCreateTask: boolean
  canEditTask: boolean
  canDeleteTask: boolean
  onCreateTask: Parameters<typeof TaskModal>[0]['onCreate']
  onUpdateTask: Parameters<typeof TaskModal>[0]['onUpdate']
  onDeleteTask: (id: string) => Promise<void>
  onMoveTask: (id: string, column: Column, position: number) => Promise<void>
  onArchiveTask: (id: string) => Promise<void>
  onUnarchiveTask: (id: string) => Promise<void>
}

const DEFAULT_FILTERS: Filters = { search: '', tag: '', priority: '', assignee_id: '' }

export default function KanbanBoard({
  projectId,
  tasks,
  archivedTasks,
  members,
  canCreateTask,
  canEditTask,
  canDeleteTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
  onArchiveTask,
  onUnarchiveTask,
}: KanbanBoardProps) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeTask, setActiveTask] = useState<Task | undefined>()
  const [defaultColumn, setDefaultColumn] = useState<Column>('todo')
  const [deleteTask, setDeleteTask] = useState<Task | undefined>()
  const [deleting, setDeleting] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.tag && task.tag !== filters.tag) return false
      if (filters.priority && task.priority !== filters.priority) return false
      if (filters.assignee_id && task.assignee_id !== filters.assignee_id) return false
      return true
    })
  }, [tasks, filters])

  const tasksByColumn = useMemo(() => {
    const map = {} as Record<Column, Task[]>
    COLUMNS.forEach((col) => {
      map[col] = filteredTasks
        .filter((t) => t.column === col)
        .sort((a, b) => a.position - b.position)
    })
    return map
  }, [filteredTasks])

  const total = tasks.length
  const inProgress = tasks.filter((t) => t.column === 'progress').length
  const done = tasks.filter((t) => t.column === 'done').length
  const completionPct = total === 0 ? 0 : Math.round((done / total) * 100)

  const handleDragEnd = (result: DropResult) => {
    if (!canEditTask) return
    if (!result.destination) return
    const { draggableId, source, destination } = result
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const destColumn = destination.droppableId as Column
    const destTasks = tasksByColumn[destColumn].filter((t) => t.id !== draggableId)

    let newPosition: number
    const prev = destTasks[destination.index - 1]
    const next = destTasks[destination.index]

    if (!prev && !next)   newPosition = 1
    else if (!prev)       newPosition = next.position - 0.5
    else if (!next)       newPosition = prev.position + 1
    else                  newPosition = positionBetween(prev.position, next.position)

    onMoveTask(draggableId, destColumn, newPosition)
  }

  const openCreateModal = (col: Column) => {
    setDefaultColumn(col)
    setActiveTask(undefined)
    setModalMode('create')
    setModalOpen(true)
  }

  const openEditModal = (task: Task) => {
    setActiveTask(task)
    setModalMode('edit')
    setModalOpen(true)
  }

  const openDeleteConfirm = (task: Task) => {
    setDeleteTask(task)
  }

  const handleArchiveCard = (task: Task) => {
    onArchiveTask(task.id)
  }

  const confirmDelete = async () => {
    if (!deleteTask) return
    setDeleting(true)
    await onDeleteTask(deleteTask.id)
    setDeleting(false)
    setDeleteTask(undefined)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats row */}
      <div className="flex items-center gap-6 px-6 py-4 border-b border-gray-100 bg-white">
        <Stat label="Total" value={total} />
        <Stat label="In Progress" value={inProgress} highlight />
        <Stat label="Done" value={done} />
        {archivedTasks.length > 0 && (
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-amber-600 hover:text-amber-800 font-medium border border-amber-200 rounded-md px-2 py-0.5 hover:bg-amber-50 transition-colors"
          >
            {archivedTasks.length} archived
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{completionPct}%</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-gray-100 bg-white">
        <FilterBar filters={filters} members={members} onChange={setFilters} />
      </div>

      {/* Archived panel */}
      {showArchived && (
        <ArchivedTasksPanel
          tasks={archivedTasks}
          members={members}
          canEdit={canEditTask}
          onUnarchive={onUnarchiveTask}
          onDelete={onDeleteTask}
          onClose={() => setShowArchived(false)}
        />
      )}

      {/* Columns */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-6 min-w-max">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col}
                column={col}
                tasks={tasksByColumn[col]}
                members={members}
                canAddTask={canCreateTask}
                canEditTask={canEditTask}
                canDeleteTask={canDeleteTask}
                onAddTask={openCreateModal}
                onEditTask={openEditModal}
                onDeleteTask={openDeleteConfirm}
                onArchiveTask={canEditTask ? handleArchiveCard : undefined}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Task modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        task={activeTask}
        projectId={projectId}
        defaultColumn={defaultColumn}
        members={members}
        canEdit={canEditTask}
        onCreate={onCreateTask}
        onUpdate={onUpdateTask}
        onDelete={canDeleteTask ? onDeleteTask : undefined}
        onArchive={canEditTask ? onArchiveTask : undefined}
        onUnarchive={canEditTask ? onUnarchiveTask : undefined}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTask}
        onClose={() => setDeleteTask(undefined)}
        onConfirm={confirmDelete}
        title="Delete task"
        description={`Are you sure you want to delete "${deleteTask?.title}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">{label}</p>
      <p className={highlight ? 'text-lg font-semibold text-indigo-600' : 'text-lg font-semibold text-gray-900'}>
        {value}
      </p>
    </div>
  )
}
