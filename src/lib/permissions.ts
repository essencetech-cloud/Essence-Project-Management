import type { ProjectRole, SystemRole } from '@/lib/types'
export type { ProjectRole, SystemRole }

export type Action =
  | 'view_project'
  | 'edit_project'
  | 'delete_project'
  | 'manage_members'
  | 'view_tasks'
  | 'create_task'
  | 'edit_task'
  | 'delete_task'
  | 'assign_task'
  | 'view_docs'
  | 'create_doc'
  | 'edit_doc'
  | 'delete_doc'

const ROLE_PERMISSIONS: Record<ProjectRole, Action[]> = {
  VIEWER: [
    'view_project',
    'view_tasks',
    'view_docs',
  ],
  DEVELOPER: [
    'view_project',
    'view_tasks', 'create_task', 'edit_task', 'assign_task',
    'view_docs',  'create_doc',  'edit_doc',
  ],
  DESIGNER: [
    'view_project',
    'view_tasks', 'create_task', 'edit_task', 'assign_task',
    'view_docs',  'create_doc',  'edit_doc',
  ],
  ADMIN: [
    'view_project', 'edit_project', 'manage_members',
    'view_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
    'view_docs',  'create_doc',  'edit_doc',  'delete_doc',
  ],
  OWNER: [
    'view_project', 'edit_project', 'delete_project', 'manage_members',
    'view_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task',
    'view_docs',  'create_doc',  'edit_doc',  'delete_doc',
  ],
}

export function can(
  action: Action,
  projectRole: ProjectRole | null,
  systemRole: SystemRole
): boolean {
  if (systemRole === 'SUPER_ADMIN') return true
  if (!projectRole) return false
  return ROLE_PERMISSIONS[projectRole].includes(action)
}

export function requirePermission(
  action: Action,
  projectRole: ProjectRole | null,
  systemRole: SystemRole
): void {
  if (!can(action, projectRole, systemRole)) {
    throw new Error(`Permission denied: ${action}`)
  }
}
