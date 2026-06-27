'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProjects } from '@/hooks/useProjects'
import ProjectForm from '@/components/projects/ProjectForm'
import type { ProjectColor } from '@/lib/types'

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false)
  const { createProject } = useProjects()
  const router = useRouter()

  const handleSubmit = async (data: { name: string; description: string; color: ProjectColor }) => {
    setLoading(true)
    const project = await createProject(data)
    if (project) {
      router.push(`/projects/${project.id}/tasks`)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">New Project</h1>
      <ProjectForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
