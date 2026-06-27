'use client'

import { useState, useEffect, useCallback, type KeyboardEvent } from 'react'
import { Trash2, Archive, ArchiveRestore } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { TAG_CONFIG, PRIORITY_CONFIG, TAGS, PRIORITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { getDueDateStatus, dueDateClasses } from '@/lib/getDueDateStatus'
import CommentSection from './CommentSection'
import AttachmentSection from '@/components/attachments/AttachmentSection'
import type { Task, CreateTaskInput, UpdateTaskInput, Tag, Priority, Column, Profile } from '@/lib/types'

interface TaskModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  task?: Task
  projectId: string
  defaultColumn?: Column
  members: Profile[]
  canEdit?: boolean
  onCreate?: (data: CreateTaskInput) => Promise<Task | null>
  onUpdate?: (id: string, data: UpdateTaskInput) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onArchive?: (id: string) => Promise<void>
  onUnarchive?: (id: string) => Promise<void>
}

export default function TaskModal({
  open,
  onClose,
  mode,
  task,
  projectId,
  defaultColumn = 'todo',
  members,
  canEdit = true,
  onCreate,
  onUpdate,
  onDelete,
  onArchive,
  onUnarchive,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tag, setTag] = useState<Tag>('feature')
  const [priority, setPriority] = useState<Priority>('medium')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details')

  const dueDateStatus = getDueDateStatus(dueDate, task?.column ?? 'todo')

  useEffect(() => {
    if (open) {
      setActiveTab('details')
      if (mode === 'edit' && task) {
        setTitle(task.title)
        setDescription(task.description ?? '')
        setTag(task.tag)
        setPriority(task.priority)
        setAssigneeId(task.assignee_id ?? '')
        setDueDate(task.due_date ?? '')
      } else {
        setTitle('')
        setDescription('')
        setTag('feature')
        setPriority('medium')
        setAssigneeId('')
        setDueDate('')
      }
    }
  }, [open, mode, task])

  const handleSave = useCallback(async () => {
    if (!title.trim()) return
    setSaving(true)

    if (mode === 'create' && onCreate) {
      await onCreate({
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || undefined,
        column: defaultColumn,
        tag,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      })
    } else if (mode === 'edit' && task && onUpdate) {
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        tag,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      })
    }

    setSaving(false)
    onClose()
  }, [title, description, tag, priority, assigneeId, dueDate, mode, onCreate, onUpdate, task, projectId, defaultColumn, onClose])

  const handleDelete = async () => {
    if (!task || !onDelete) return
    setDeleting(true)
    await onDelete(task.id)
    setDeleting(false)
    onClose()
  }

  const handleArchive = async () => {
    if (!task || !onArchive) return
    setArchiving(true)
    await onArchive(task.id)
    setArchiving(false)
    onClose()
  }

  const handleUnarchive = async () => {
    if (!task || !onUnarchive) return
    setArchiving(true)
    await onUnarchive(task.id)
    setArchiving(false)
    onClose()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && activeTab === 'details') {
      e.preventDefault()
      handleSave()
    }
  }

  const isArchived = !!task?.archived_at

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <div onKeyDown={handleKeyDown}>
        {/* Header with tabs */}
        {mode === 'edit' && (
          <div className="flex items-center gap-0 border-b border-gray-100 px-6">
            {(['details', 'comments', 'attachments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-3 py-3 text-sm font-medium capitalize transition-colors',
                  activeTab === tab ? 'text-gray-900 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className="p-6">
          {activeTab === 'details' && (
            <>
              {/* Archived banner */}
              {isArchived && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
                  <Archive className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-xs text-amber-700 font-medium">This task is archived</span>
                </div>
              )}

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                disabled={!canEdit}
                className="w-full text-lg font-medium text-gray-900 placeholder:text-gray-300 bg-transparent border-0 outline-none resize-none mb-2 disabled:cursor-default"
                autoFocus={mode === 'create'}
              />

              {/* Description */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description…"
                disabled={!canEdit}
                rows={3}
                className="w-full text-sm text-gray-600 placeholder:text-gray-300 bg-transparent border-0 outline-none resize-none mb-4 disabled:cursor-default"
              />

              {/* Selectors row */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Tag */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Tag</label>
                  <div className="flex flex-wrap gap-1">
                    {TAGS.map((t) => {
                      const cfg = TAG_CONFIG[t]
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => setTag(t)}
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-150',
                            tag === t ? cn(cfg.bg, cfg.text) : 'text-gray-400 hover:bg-gray-100',
                            !canEdit && 'cursor-default'
                          )}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Priority</label>
                  <div className="flex flex-wrap gap-1">
                    {PRIORITIES.map((p) => {
                      const cfg = PRIORITY_CONFIG[p]
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={!canEdit}
                          onClick={() => setPriority(p)}
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-medium flex items-center gap-1 transition-all duration-150',
                            priority === p ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-100',
                            !canEdit && 'cursor-default'
                          )}
                        >
                          <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Assignee</label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={!canEdit}
                    className="w-full h-8 rounded-lg border border-gray-200 bg-white px-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default disabled:bg-gray-50"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <label className={cn('text-xs font-medium mb-1 block', dueDateStatus ? dueDateClasses(dueDateStatus) : 'text-gray-500')}>
                    Due date{dueDateStatus === 'overdue' ? ' — Overdue!' : dueDateStatus === 'due-today' ? ' — Today!' : dueDateStatus === 'due-soon' ? ' — Soon' : ''}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={!canEdit}
                    className={cn(
                      'w-full h-8 rounded-lg border bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-default disabled:bg-gray-50',
                      dueDateStatus === 'overdue'   ? 'border-rose-300 text-rose-600' :
                      dueDateStatus === 'due-today' ? 'border-amber-300 text-amber-600' :
                      dueDateStatus === 'due-soon'  ? 'border-amber-200 text-amber-500' :
                      'border-gray-200 text-gray-900'
                    )}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {canEdit && (
                    <>
                      <Button onClick={handleSave} loading={saving} size="sm">
                        {mode === 'create' ? 'Add task' : 'Save'}
                      </Button>
                      <Button variant="secondary" size="sm" onClick={onClose}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {!canEdit && (
                    <Button variant="secondary" size="sm" onClick={onClose}>
                      Close
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {mode === 'edit' && canEdit && onArchive && !isArchived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleArchive}
                      loading={archiving}
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Archive
                    </Button>
                  )}
                  {mode === 'edit' && canEdit && onUnarchive && isArchived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUnarchive}
                      loading={archiving}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    >
                      <ArchiveRestore className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                  )}
                  {mode === 'edit' && canEdit && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      loading={deleting}
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {canEdit && <p className="text-xs text-gray-300 mt-2">⌘ + Enter to save</p>}
            </>
          )}

          {activeTab === 'comments' && task && (
            <CommentSection taskId={task.id} />
          )}

          {activeTab === 'attachments' && task && (
            <AttachmentSection taskId={task.id} canEdit={canEdit} />
          )}
        </div>
      </div>
    </Modal>
  )
}
