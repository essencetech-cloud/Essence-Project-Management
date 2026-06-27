import { db } from '@/lib/db'

interface CreateNotificationParams {
  user_id: string
  type: string
  title: string
  body?: string
  link?: string
}

export function createNotification(params: CreateNotificationParams): void {
  db.notification
    .create({
      data: {
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        body: params.body ?? null,
        link: params.link ?? null,
      },
    })
    .catch(() => {})
}
