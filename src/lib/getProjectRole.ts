import { db } from '@/lib/db'
import type { ProjectRole, SystemRole } from '@prisma/client'

export async function getProjectRole(
  userId: string,
  projectId: string
): Promise<{ projectRole: ProjectRole | null; systemRole: SystemRole }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { systemRole: true },
  })

  if (!user) return { projectRole: null, systemRole: 'MEMBER' }

  if (user.systemRole === 'SUPER_ADMIN') {
    return { projectRole: 'OWNER', systemRole: 'SUPER_ADMIN' }
  }

  const member = await db.projectMember.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: userId } },
    select: { role: true },
  })

  return {
    projectRole: member?.role ?? null,
    systemRole: user.systemRole,
  }
}
