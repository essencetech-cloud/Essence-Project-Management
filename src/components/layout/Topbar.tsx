'use client'

import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'
import NotificationBell from '@/components/notifications/NotificationBell'
import GlobalSearch from '@/components/search/GlobalSearch'
import type { Project } from '@/lib/types'

interface TopbarProps {
  project: Project
}

export default function Topbar({ project }: TopbarProps) {
  const colorConfig = PROJECT_COLORS[project.color] ?? PROJECT_COLORS.indigo

  return (
    <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={cn('h-2.5 w-2.5 rounded-full flex-shrink-0', colorConfig.bg)} />
        <h1 className="text-base font-semibold text-gray-900">{project.name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <GlobalSearch />
        <NotificationBell />
      </div>
    </div>
  )
}
