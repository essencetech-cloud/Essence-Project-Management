'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FolderOpen, LogOut, LayoutGrid, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import type { ProjectColor } from '@/lib/types'

export default function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const { projects } = useProjects()
  const [mobileOpen, setMobileOpen] = useState(false)

  const recentProjects = projects.slice(0, 5)
  const isSuperAdmin = profile?.systemRole === 'SUPER_ADMIN'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link
          href="/projects"
          className="text-xl font-semibold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors duration-150"
          onClick={() => setMobileOpen(false)}
        >
          Essence
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        <Link
          href="/projects"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
            pathname === '/projects'
              ? 'bg-indigo-50 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          )}
        >
          <LayoutGrid className="h-4 w-4 flex-shrink-0" />
          All Projects
        </Link>

        {recentProjects.length > 0 && (
          <div className="mt-5">
            <p className="px-3 mb-1.5 text-[11px] uppercase tracking-widest font-medium text-gray-400">
              Projects
            </p>
            <ul className="space-y-0.5">
              {recentProjects.map((project) => {
                const colorConfig = PROJECT_COLORS[project.color as ProjectColor] ?? PROJECT_COLORS.indigo
                const isActive = pathname.startsWith(`/projects/${project.id}`)
                return (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}/tasks`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                        isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', colorConfig.bg)} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {isSuperAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              pathname.startsWith('/admin')
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <Shield className="h-4 w-4 flex-shrink-0" />
            Admin Panel
          </Link>
        )}

        {profile && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar name={profile.full_name} color={profile.avatar_color} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.full_name}</p>
              {isSuperAdmin && (
                <p className="text-[10px] text-violet-600 font-medium uppercase tracking-wide">Super Admin</p>
              )}
            </div>
            <button
              onClick={signOut}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
      >
        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-[220px] bg-white border-r border-gray-100 transition-transform duration-200 md:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>

      <aside className="hidden md:flex flex-col w-[220px] flex-shrink-0 border-r border-gray-100 bg-white">
        {sidebarContent}
      </aside>
    </>
  )
}
