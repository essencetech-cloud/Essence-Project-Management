'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDocs } from '@/hooks/useDocs'

interface Props {
  params: Promise<{ projectId: string }>
}

export default function NewDocPage({ params }: Props) {
  const { projectId } = use(params)
  const { createDoc } = useDocs(projectId)
  const router = useRouter()

  useEffect(() => {
    const create = async () => {
      const doc = await createDoc(projectId, 'Untitled')
      if (doc) {
        router.replace(`/projects/${projectId}/docs/${doc.id}`)
      } else {
        router.replace(`/projects/${projectId}/docs`)
      }
    }
    create()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-gray-400">Creating document…</p>
    </div>
  )
}
