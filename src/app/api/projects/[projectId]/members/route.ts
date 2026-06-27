import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import type { ProjectRole } from '@/lib/types'

interface Params { params: Promise<{ projectId: string }> }

function serializeUser(u: { id: string; full_name: string; email: string; avatar_color: string; systemRole: string; created_at: Date }) {
  return { ...u, created_at: u.created_at.toISOString() }
}

const USER_SELECT = { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true }

export async function GET(_req: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('view_project', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const members = await db.projectMember.findMany({
    where: { project_id: projectId },
    include: { user: { select: USER_SELECT } },
    orderBy: { joined_at: 'asc' },
  })

  return NextResponse.json(members.map((m: (typeof members)[number]) => ({
    id: m.id,
    project_id: m.project_id,
    user_id: m.user_id,
    role: m.role,
    joined_at: m.joined_at.toISOString(),
    profile: serializeUser(m.user),
  })))
}

export async function POST(request: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('manage_members', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, role } = await request.json() as { email: string; role: ProjectRole }
  if (!email || !role) {
    return NextResponse.json({ error: 'email and role required' }, { status: 400 })
  }
  if (role === 'OWNER') {
    return NextResponse.json({ error: 'Cannot assign OWNER role via invite' }, { status: 400 })
  }

  const targetUser = await db.user.findUnique({ where: { email }, select: { id: true, full_name: true, email: true, avatar_color: true, systemRole: true, created_at: true } })
  if (!targetUser) {
    return NextResponse.json({ error: 'No user with this email' }, { status: 404 })
  }

  const existing = await db.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: targetUser.id } },
  })
  if (existing) {
    return NextResponse.json({ error: 'User is already a member' }, { status: 409 })
  }

  const member = await db.projectMember.create({
    data: { project_id: projectId, user_id: targetUser.id, role },
    include: { user: { select: USER_SELECT } },
  })

  return NextResponse.json({
    id: member.id,
    project_id: member.project_id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at.toISOString(),
    profile: serializeUser(member.user),
  }, { status: 201 })
}

export async function PATCH(request: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('manage_members', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, role } = await request.json() as { userId: string; role: ProjectRole }
  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
  }
  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 })
  }

  const targetMember = await db.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: userId } },
  })
  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (targetMember.role === 'OWNER' && projectRole !== 'OWNER') {
    return NextResponse.json({ error: 'Only OWNER can change another OWNER\'s role' }, { status: 403 })
  }
  if (role === 'OWNER') {
    return NextResponse.json({ error: 'Cannot assign OWNER role' }, { status: 400 })
  }

  const updated = await db.projectMember.update({
    where: { project_id_user_id: { project_id: projectId, user_id: userId } },
    data: { role },
    include: { user: { select: USER_SELECT } },
  })

  return NextResponse.json({
    id: updated.id,
    project_id: updated.project_id,
    user_id: updated.user_id,
    role: updated.role,
    joined_at: updated.joined_at.toISOString(),
    profile: serializeUser(updated.user),
  })
}

export async function DELETE(request: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('manage_members', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json() as { userId: string }
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  if (userId === session.userId) {
    return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
  }

  const targetMember = await db.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: userId } },
  })
  if (!targetMember) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }
  if (targetMember.role === 'OWNER') {
    return NextResponse.json({ error: 'Cannot remove the project OWNER' }, { status: 400 })
  }

  await db.projectMember.delete({
    where: { project_id_user_id: { project_id: projectId, user_id: userId } },
  })

  return new NextResponse(null, { status: 204 })
}
