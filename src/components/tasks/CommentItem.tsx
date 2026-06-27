'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import { formatRelative } from '@/lib/utils'
import type { Comment } from '@/lib/types'

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onEdit: (id: string, body: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function CommentItem({ comment, currentUserId, onEdit, onDelete }: CommentItemProps) {
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState(comment.body)
  const [saving, setSaving] = useState(false)
  const isSelf = comment.user_id === currentUserId

  const handleSave = async () => {
    if (!body.trim()) return
    setSaving(true)
    await onEdit(comment.id, body.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="flex items-start gap-3 group">
      <Avatar name={comment.user.full_name} color={comment.user.avatar_color} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">{comment.user.full_name}</span>
          <span className="text-xs text-gray-400">{formatRelative(comment.created_at)}</span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-xs text-gray-300">(edited)</span>
          )}
        </div>

        {editing ? (
          <div className="space-y-1.5">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
              autoFocus
              className="w-full text-sm text-gray-700 rounded-lg border border-gray-200 px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleSave}
                disabled={saving || !body.trim()}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Check className="h-3 w-3" /> Save
              </button>
              <button
                onClick={() => { setEditing(false); setBody(comment.body) }}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
        )}
      </div>

      {isSelf && !editing && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
