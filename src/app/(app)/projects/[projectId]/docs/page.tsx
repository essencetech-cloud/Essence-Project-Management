'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useDocs } from '@/hooks/useDocs'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import DocList from '@/components/docs/DocList'
import Button from '@/components/ui/Button'
import { useState } from 'react'

interface Props {
  params: Promise<{ projectId: string }>
}

export default function DocsPage({ params }: Props) {
  const { projectId } = use(params)
  const { docs, loading, createDoc } = useDocs(projectId)
  const { can } = useProjectPermissions(projectId)
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  const handleNewDoc = async () => {
    setCreating(true)
    const doc = await createDoc(projectId, 'Untitled')
    if (doc) {
      router.push(`/projects/${projectId}/docs/${doc.id}`)
    } else {
      setCreating(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Docs</h2>
        {can('create_doc') && (
          <Button size="sm" onClick={handleNewDoc} loading={creating}>
            <Plus className="h-4 w-4" />
            New Doc
          </Button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <DocList docs={docs} projectId={projectId} loading={loading} />
      </div>
    </div>
  )
}
