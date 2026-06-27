'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, FolderOpen, CheckSquare, FileText, Shield, ShieldOff } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/utils'

interface AdminUser {
  id: string
  full_name: string
  email: string
  avatar_color: string
  systemRole: 'SUPER_ADMIN' | 'MEMBER'
  created_at: string
}

interface AdminProject {
  id: string
  name: string
  color: string
  created_at: string
  owner: { id: string; full_name: string; email: string }
  member_count: number
  task_count: number
}

interface Stats {
  users: number
  projects: number
  tasks: number
  docs: number
}

export default function AdminPage() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [users, setUsers]     = useState<AdminUser[]>([])
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/projects').then((r) => r.json()),
    ]).then(([s, u, p]) => {
      setStats(s)
      setUsers(u)
      setProjects(p)
      setLoading(false)
    })
  }, [])

  const toggleSystemRole = async (user: AdminUser) => {
    setTogglingId(user.id)
    const newRole = user.systemRole === 'SUPER_ADMIN' ? 'MEMBER' : 'SUPER_ADMIN'
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemRole: newRole }),
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    }
    setTogglingId(null)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
          <Shield className="h-4 w-4 text-violet-700" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-400">System overview — visible only to Super Admins</p>
        </div>
      </div>

      {/* Stats */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users}       label="Total Users"    value={stats.users}    color="indigo" />
            <StatCard icon={FolderOpen}  label="Total Projects" value={stats.projects} color="violet" />
            <StatCard icon={CheckSquare} label="Total Tasks"    value={stats.tasks}    color="emerald" />
            <StatCard icon={FileText}    label="Total Docs"     value={stats.docs}     color="sky" />
          </div>
        )}
      </section>

      {/* Users */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Users</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={user.full_name} color={user.avatar_color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <Badge className={user.systemRole === 'SUPER_ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-500'}>
                  {user.systemRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Member'}
                </Badge>
                <span className="text-xs text-gray-400 hidden md:block w-28 text-right">
                  {formatRelative(user.created_at)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={togglingId === user.id}
                  onClick={() => toggleSystemRole(user)}
                  className={cn(
                    'text-xs gap-1',
                    user.systemRole === 'SUPER_ADMIN'
                      ? 'text-rose-500 hover:text-rose-700'
                      : 'text-violet-600 hover:text-violet-800'
                  )}
                >
                  {user.systemRole === 'SUPER_ADMIN' ? (
                    <><ShieldOff className="h-3.5 w-3.5" />Remove Admin</>
                  ) : (
                    <><Shield className="h-3.5 w-3.5" />Make Admin</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">All Projects</h2>
        {loading ? (
          <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{project.name}</p>
                  <p className="text-xs text-gray-400">Owner: {project.owner.full_name}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{project.member_count} member{project.member_count !== 1 ? 's' : ''}</span>
                  <span>{project.task_count} task{project.task_count !== 1 ? 's' : ''}</span>
                  <span className="hidden md:block">{formatRelative(project.created_at)}</span>
                </div>
                <Link
                  href={`/projects/${project.id}/tasks`}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View
                </Link>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">No projects yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: number; color: string }) {
  const styles: Record<string, string> = {
    indigo:  'bg-indigo-50  text-indigo-700',
    violet:  'bg-violet-50  text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    sky:     'bg-sky-50     text-sky-700',
  }
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', styles[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}
