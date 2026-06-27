import Link from 'next/link'
import { ArrowRight, Users, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'
import type { Project, ProjectColor } from '@/lib/types'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const colorConfig = PROJECT_COLORS[project.color as ProjectColor] ?? PROJECT_COLORS.indigo

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-all duration-150 group">
      {/* Color bar */}
      <div className={cn('h-1 w-full', colorConfig.bg)} />

      <div className="p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-4">{project.description}</p>
        )}
        {!project.description && <div className="mb-4" />}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.member_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5" />
              {project.task_count ?? 0}
            </span>
          </div>

          <Link
            href={`/projects/${project.id}/tasks`}
            className={cn(
              'flex items-center gap-1 text-xs font-medium transition-all duration-150',
              'text-gray-400 group-hover:text-gray-700',
              colorConfig.text
            )}
          >
            Open
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
