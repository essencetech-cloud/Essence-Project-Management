import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { getProjectRole } from '@/lib/getProjectRole'

interface Params { params: Promise<{ projectId: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { projectId } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  return NextResponse.json({ projectRole, systemRole })
}
