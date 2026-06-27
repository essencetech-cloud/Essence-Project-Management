'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import CommentItem from './CommentItem'
import { Skeleton } from '@/components/ui/Skeleton'
import { useComments } from '@/hooks/useComments'
import { useAuth } from '@/hooks/useAuth'

interface CommentSectionProps {
  taskId: string
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const { comments, loading, addComment, editComment, deleteComment } = useComments(taskId)
  const { user } = useAuth()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!draft.trim()) return
    setSending(true)
    await addComment(draft.trim())
    setDraft('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={user?.id ?? ''}
              onEdit={editComment}
              onDelete={deleteComment}
            />
          ))}
          {comments.length === 0 && (
            <p className="text-xs text-gray-400">No comments yet. Be the first!</p>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 pt-2 border-t border-gray-100">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment…"
          rows={2}
          className="flex-1 text-sm text-gray-700 placeholder:text-gray-300 rounded-lg border border-gray-200 px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSubmit}
          disabled={sending || !draft.trim()}
          className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="text-xs text-gray-300 mt-1">⌘ + Enter to post</p>
    </div>
  )
}
