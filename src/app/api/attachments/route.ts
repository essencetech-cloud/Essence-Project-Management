import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth-utils'
import { db } from '@/lib/db'
import { getProjectRole } from '@/lib/getProjectRole'
import { can } from '@/lib/permissions'
import { saveFile } from '@/lib/storage'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData()
  const file = form.get('file') as File | null
  const taskId = form.get('task_id') as string | null
  const docId  = form.get('doc_id')  as string | null

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (!taskId && !docId) return NextResponse.json({ error: 'task_id or doc_id required' }, { status: 400 })

  let projectId: string
  if (taskId) {
    const task = await db.task.findUnique({ where: { id: taskId }, select: { project_id: true } })
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    projectId = task.project_id
  } else {
    const doc = await db.doc.findUnique({ where: { id: docId! }, select: { project_id: true } })
    if (!doc) return NextResponse.json({ error: 'Doc not found' }, { status: 404 })
    projectId = doc.project_id
  }

  const { projectRole, systemRole } = await getProjectRole(session.userId, projectId)
  const action = taskId ? 'edit_task' : 'edit_doc'
  if (!can(action, projectRole, systemRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 })
  }

  const id = randomUUID()
  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await saveFile(id, buffer, file.name)

  const attachment = await db.attachment.create({
    data: {
      id,
      task_id: taskId ?? null,
      doc_id: docId ?? null,
      uploaded_by: session.userId,
      name: file.name,
      mime_type: file.type || 'application/octet-stream',
      size: file.size,
      url,
    },
    include: {
      uploader: { select: { id: true, full_name: true, avatar_color: true } },
    },
  })

  return NextResponse.json(
    { ...attachment, created_at: attachment.created_at.toISOString() },
    { status: 201 }
  )
}

export async function GET(request: Request) {
  const session = await getSessionUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get('task_id')
  const docId  = searchParams.get('doc_id')

  if (!taskId && !docId) return NextResponse.json({ error: 'task_id or doc_id required' }, { status: 400 })

  const attachments = await db.attachment.findMany({
    where: taskId ? { task_id: taskId } : { doc_id: docId! },
    orderBy: { created_at: 'asc' },
    include: {
      uploader: { select: { id: true, full_name: true, avatar_color: true } },
    },
  })

  return NextResponse.json(
    attachments.map((a) => ({ ...a, created_at: a.created_at.toISOString() }))
  )
}
