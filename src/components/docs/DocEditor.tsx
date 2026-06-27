'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, CheckSquare, Link2, Minus, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Doc } from '@/lib/types'

interface DocEditorProps {
  doc: Doc
  readOnly?: boolean
  onSave: (data: { title?: string; content?: Record<string, unknown> }) => Promise<void>
}

function ToolbarButton({
  onClick, active, label, children,
}: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'p-1.5 rounded-md text-sm transition-all duration-150',
        active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {children}
    </button>
  )
}

export default function DocEditor({ doc, readOnly = false, onSave }: DocEditorProps) {
  const [title, setTitle] = useState(doc.title)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerAutoSave = useCallback(
    (content: Record<string, unknown>) => {
      if (readOnly) return
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        await onSave({ content })
        setSavedAt(new Date())
        setShowSaved(true)
        setTimeout(() => setShowSaved(false), 2000)
      }, 1500)
    },
    [onSave, readOnly]
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: readOnly ? '' : 'Start writing…' }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: doc.content ?? undefined,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      triggerAutoSave(editor.getJSON() as Record<string, unknown>)
    },
    editorProps: {
      attributes: {
        class: cn('outline-none min-h-[500px] prose prose-sm max-w-none', readOnly && 'cursor-default'),
      },
    },
  })

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleTitleBlur = async () => {
    if (readOnly) return
    if (title !== doc.title) await onSave({ title })
  }

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar — hidden for read-only */}
      {!readOnly && (
        <div className="flex items-center gap-0.5 px-6 py-2 border-b border-gray-100 bg-white flex-wrap">
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="Bold">
            <Bold className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="Italic">
            <Italic className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} label="Strikethrough">
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} label="Heading 1">
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="Heading 2">
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} label="Heading 3">
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="Bullet list">
            <List className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="Ordered list">
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive('taskList')} label="Task list">
            <CheckSquare className="h-3.5 w-3.5" />
          </ToolbarButton>
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarButton
            onClick={() => { const url = window.prompt('Enter URL'); if (url) editor.chain().focus().setLink({ href: url }).run() }}
            active={editor.isActive('link')} label="Link"
          >
            <Link2 className="h-3.5 w-3.5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} label="Divider">
            <Minus className="h-3.5 w-3.5" />
          </ToolbarButton>
          {showSaved && (
            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" />
              Saved
            </div>
          )}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            readOnly={readOnly}
            className={cn(
              'w-full text-3xl font-semibold text-gray-900 bg-transparent border-0 outline-none mb-1 placeholder:text-gray-200',
              readOnly && 'cursor-default'
            )}
            placeholder="Untitled"
          />
          <p className="text-xs text-gray-400 mb-8">
            {readOnly
              ? 'Read-only — you don\'t have permission to edit this document'
              : savedAt ? `Last saved ${savedAt.toLocaleTimeString()}` : 'Auto-saves as you type'}
          </p>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
