import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import ProjectNav from '@/components/layout/ProjectNav'
import type { Project } from '@/lib/types'

interface Props {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: Props) {
  const { projectId } = await params

  const project = await db.project.findUnique({ where: { id: projectId } })
  if (!project) notFound()

  const p: Project = {
    ...project,
    description: project.description ?? null,
    created_at: project.created_at.toISOString(),
    updated_at: project.updated_at.toISOString(),
  } as Project

  return (
    <div className="flex flex-col h-full">
      <Topbar project={p} />
      <ProjectNav projectId={projectId} projectColor={p.color as Project['color']} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
