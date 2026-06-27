import { db } from '@/lib/db'

interface LogActivityParams {
  project_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id?: string
  entity_name?: string
  metadata?: Record<string, unknown>
}

export function logActivity(params: LogActivityParams): void {
  db.activityLog
    .create({
      data: {
        project_id: params.project_id,
        user_id: params.user_id,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id ?? null,
        entity_name: params.entity_name ?? null,
        metadata: params.metadata ? (params.metadata as import('@prisma/client').Prisma.InputJsonValue) : undefined,
      },
    })
    .catch(() => {})
}
