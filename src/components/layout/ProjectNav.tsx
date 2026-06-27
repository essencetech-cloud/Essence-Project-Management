'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import type { ProjectColor } from '@/lib/types'

interface ProjectNavProps {
  projectId: string
  projectColor: ProjectColor
}

export default function ProjectNav({ projectId, projectColor }: ProjectNavProps) {
  const pathname = usePathname()
  const colorConfig = PROJECT_COLORS[projectColor] ?? PROJECT_COLORS.indigo
  const { can, loading } = useProjectPermissions(projectId)

  const tabs = [
    { label: 'Overview', href: 'overview', always: true },
    { label: 'Tasks',    href: 'tasks',    always: true },
    { label: 'Docs',     href: 'docs',     always: true },
    { label: 'Settings', href: 'settings', always: false, show: !loading && can('edit_project') },
  ].filter((t) => t.always || t.show)

  return (
    <div className="flex items-center gap-1 px-6 border-b border-gray-100 bg-white">
      {tabs.map((tab) => {
        const href = `/projects/${projectId}/${tab.href}`
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              'relative px-3 py-3 text-sm font-medium transition-all duration-150',
              isActive ? cn('text-gray-900', colorConfig.text) : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
            {isActive && (
              <span className={cn('absolute bottom-0 left-0 right-0 h-0.5 rounded-full', colorConfig.bg)} />
            )}
          </Link>
        )
      })}
    </div>
  )
}
