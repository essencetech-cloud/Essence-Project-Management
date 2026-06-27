'use client'

import { useRef } from 'react'
import { Paperclip, X, Download, FileText } from 'lucide-react'
import { useAttachments } from '@/hooks/useAttachments'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface AttachmentSectionProps {
  taskId?: string
  docId?: string
  canEdit: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentSection({ taskId, docId, canEdit }: AttachmentSectionProps) {
  const { attachments, loading, upload, remove } = useAttachments(taskId ?? null, docId ?? null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    for (const file of Array.from(files)) {
      await upload(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </h3>
        {canEdit && (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach file
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
        </div>
      ) : (
        <>
          {attachments.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 group"
                >
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400">{formatBytes(a.size)}</p>
                  </div>
                  <a
                    href={a.url}
                    download={a.name}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    aria-label="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  {canEdit && (
                    <button
                      onClick={() => remove(a.id)}
                      className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove attachment"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canEdit && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-4 cursor-pointer',
                'hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors'
              )}
            >
              <Paperclip className="h-5 w-5 text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Drop files here or click to upload</p>
              <p className="text-xs text-gray-300 mt-0.5">Max 10 MB per file</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
