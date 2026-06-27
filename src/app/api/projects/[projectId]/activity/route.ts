import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'

interface Params { params: Promise<{ projectId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  if (!can('view_project', projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const logs = await db.activityLog.findMany({
    where: { project_id: projectId },
    orderBy: { created_at: 'desc' },
    take: 50,
    include: {
      user: { select: { id: true, full_name: true, avatar_color: true } },
    },
  })

  return NextResponse.json(
    logs.map((l: (typeof logs)[number]) => ({
      ...l,
      created_at: l.created_at.toISOString(),
    }))
  )
}
