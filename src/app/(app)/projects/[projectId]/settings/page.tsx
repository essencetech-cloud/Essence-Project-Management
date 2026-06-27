'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS, PROJECT_COLOR_KEYS } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useProjectPermissions } from '@/hooks/useProjectPermissions'
import { useAuth } from '@/hooks/useAuth'
import type { Project, ProjectColor, ProjectMember } from '@/lib/types'
import type { ProjectRole } from '@/lib/permissions'

interface Props {
  params: Promise<{ projectId: string }>
}

const ROLE_COLORS: Record<ProjectRole, string> = {
  OWNER:     'bg-violet-100 text-violet-700',
  ADMIN:     'bg-blue-100 text-blue-700',
  DEVELOPER: 'bg-emerald-100 text-emerald-700',
  DESIGNER:  'bg-pink-100 text-pink-700',
  VIEWER:    'bg-gray-100 text-gray-500',
}

const ASSIGNABLE_ROLES: ProjectRole[] = ['ADMIN', 'DEVELOPER', 'DESIGNER', 'VIEWER']

export default function SettingsPage({ params }: Props) {
  const { projectId } = use(params)
  const { profile } = useAuth()
  const { can } = useProjectPermissions(projectId)

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [membersLoading, setMembersLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState<ProjectColor>('indigo')
  const router = useRouter()

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<ProjectRole>('DEVELOPER')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState('')

  useEffect(() => {
    const fetchProject = async () => {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setProject(data)
      setName(data.name)
      setDescription(data.description ?? '')
      setColor(data.color)
      setLoading(false)
    }
    fetchProject()
  }, [projectId])

  const fetchMembers = async () => {
    setMembersLoading(true)
    const res = await fetch(`/api/projects/${projectId}/members`)
    if (res.ok) setMembers(await res.json())
    setMembersLoading(false)
  }

  useEffect(() => { fetchMembers() }, [projectId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, color }),
    })
    if (res.ok) setProject(await res.json())
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)
    await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
    router.push('/projects')
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')
    setInviteSuccess('')
    const res = await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    if (!res.ok) {
      setInviteError(data.error ?? 'Failed to invite')
    } else {
      setInviteSuccess(`${data.profile?.full_name ?? inviteEmail} added as ${inviteRole}`)
      setInviteEmail('')
      fetchMembers()
    }
    setInviting(false)
  }

  const handleChangeRole = async (userId: string, role: ProjectRole) => {
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role }),
    })
    fetchMembers()
  }

  const handleRemoveMember = async (userId: string) => {
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    fetchMembers()
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!project) return <p className="p-8 text-sm text-gray-400">Project not found.</p>

  const canManage = can('manage_members')
  const canEdit   = can('edit_project')
  const canDelete = can('delete_project')

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-10">

      {/* General settings */}
      {canEdit && (
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-4">General</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-700">Project color</label>
              <div className="flex items-center gap-2">
                {PROJECT_COLOR_KEYS.map((c) => {
                  const cfg = PROJECT_COLORS[c]
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={cn(
                        'h-7 w-7 rounded-full transition-all duration-150',
                        cfg.bg,
                        color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                      )}
                      aria-label={`Select ${c} color`}
                    />
                  )
                })}
              </div>
            </div>
            <Button type="submit" loading={saving} size="sm">Save changes</Button>
          </form>
        </section>
      )}

      {/* Members */}
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Members</h2>

        {/* Invite form — ADMIN/OWNER only */}
        {canManage && (
          <form onSubmit={handleInvite} className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Invite member</p>
            <div className="flex gap-2">
              <Input
                label=""
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@company.com"
                required
                className="flex-1"
              />
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ProjectRole)}
                    className="h-9 rounded-lg border border-gray-200 bg-white px-3 pr-8 text-sm text-gray-900 appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <Button type="submit" loading={inviting} size="sm">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </div>
            {inviteError   && <p className="text-xs text-rose-600">{inviteError}</p>}
            {inviteSuccess && <p className="text-xs text-emerald-600">{inviteSuccess}</p>}
          </form>
        )}

        {membersLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {members.map((member) => {
              const isMe = member.user_id === profile?.id
              const isOwner = member.role === 'OWNER'
              const showControls = canManage && !isMe && !isOwner

              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  {member.profile && (
                    <Avatar name={member.profile.full_name} color={member.profile.avatar_color} size="sm" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {member.profile?.full_name}
                      {isMe && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-400">{member.profile?.email}</p>
                  </div>

                  {showControls ? (
                    <div className="relative">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.user_id, e.target.value as ProjectRole)}
                        className="h-7 rounded-lg border border-gray-200 bg-white px-2 pr-6 text-xs appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-1.5 top-1.5 h-3 w-3 text-gray-400 pointer-events-none" />
                    </div>
                  ) : (
                    <Badge className={cn(ROLE_COLORS[member.role])}>{member.role}</Badge>
                  )}

                  {showControls && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-rose-600 text-xs"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      Remove
                    </Button>
                  )}
                  {(isMe || isOwner) && !showControls && (
                    <Badge className={cn(ROLE_COLORS[member.role], 'ml-auto')}>{member.role}</Badge>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Danger zone */}
      {canDelete && (
        <section>
          <h2 className="text-base font-semibold text-rose-600 mb-2">Danger zone</h2>
          <div className="border border-rose-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Delete this project</p>
              <p className="text-xs text-gray-400 mt-0.5">Permanently delete all tasks, docs, and members.</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              Delete project
            </Button>
          </div>
        </section>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete project"
        description={`Are you sure you want to delete "${project.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </div>
  )
}
