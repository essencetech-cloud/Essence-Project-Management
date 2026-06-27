import Link from 'next/link'
import { FileText } from 'lucide-react'
import { formatRelative } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import type { Doc } from '@/lib/types'

interface DocCardProps {
  doc: Doc
  projectId: string
}

export default function DocCard({ doc, projectId }: DocCardProps) {
  return (
    <Link
      href={`/projects/${projectId}/docs/${doc.id}`}
      className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-50 transition-all duration-150 group"
    >
      <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors duration-150">
        <FileText className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-150" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
        <p className="text-xs text-gray-400">Updated {formatRelative(doc.updated_at)}</p>
      </div>

      {doc.creator && (
        <Avatar
          name={doc.creator.full_name}
          color={doc.creator.avatar_color}
          size="xs"
        />
      )}
    </Link>
  )
}
