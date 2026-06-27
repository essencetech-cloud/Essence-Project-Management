export type Column   = 'todo' | 'progress' | 'review' | 'done'
export type Tag      = 'feature' | 'bug' | 'design' | 'research' | 'devops' | 'other'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'
export type ProjectRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'DESIGNER' | 'VIEWER'
export type SystemRole  = 'SUPER_ADMIN' | 'MEMBER'
export type ProjectColor = 'indigo' | 'violet' | 'rose' | 'amber' | 'emerald' | 'sky'

/** @deprecated use ProjectRole */
export type MemberRole = ProjectRole

export interface Profile {
  id: string
  full_name: string
  email: string
  avatar_color: string
  systemRole: SystemRole
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: ProjectColor
  created_by: string
  created_at: string
  updated_at: string
  member_count?: number
  task_count?: number
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectRole
  joined_at: string
  profile?: Profile
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string | null
  column: Column
  tag: Tag
  priority: Priority
  position: number
  assignee_id: string | null
  created_by: string
  due_date: string | null
  archived_at: string | null
  archived_by: string | null
  created_at: string
  updated_at: string
  assignee?: Profile
  creator?: Profile
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
  user: { id: string; full_name: string; email: string; avatar_color: string }
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export interface Attachment {
  id: string
  task_id: string | null
  doc_id: string | null
  uploaded_by: string
  name: string
  mime_type: string
  size: number
  url: string
  created_at: string
  uploader: { id: string; full_name: string; avatar_color: string }
}

export interface ActivityLogEntry {
  id: string
  project_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  user: { id: string; full_name: string; avatar_color: string }
}

export interface Doc {
  id: string
  project_id: string
  title: string
  content: Record<string, unknown> | null
  created_by: string
  updated_by: string | null
  created_at: string
  updated_at: string
  creator?: Profile
  editor?: Profile
}

export interface CreateTaskInput {
  project_id: string
  title: string
  description?: string
  column?: Column
  tag?: Tag
  priority?: Priority
  assignee_id?: string | null
  due_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  tag?: Tag
  priority?: Priority
  assignee_id?: string | null
  due_date?: string | null
}

export interface CreateDocInput {
  project_id: string
  title?: string
}

export interface Filters {
  search: string
  tag: Tag | ''
  priority: Priority | ''
  assignee_id: string
}
