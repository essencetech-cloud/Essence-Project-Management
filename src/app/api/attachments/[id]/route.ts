import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { deleteFile } from '@/lib/storage'

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const attachment = await db.attachment.findUnique({
    where: { id },
    include: {
      task: { select: { project_id: true } },
      doc:  { select: { project_id: true } },
    },
  })
  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const projectId = attachment.task?.project_id ?? attachment.doc?.project_id
  if (!projectId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isSelf = attachment.uploaded_by === session.userId
  if (!isSelf) {
    const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
    const action = attachment.task_id ? 'edit_task' : 'edit_doc'
    if (!can(action, projectRole, systemRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await deleteFile(attachment.url)
  await db.attachment.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}
