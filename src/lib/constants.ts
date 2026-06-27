import type { Column, Tag, Priority, ProjectColor } from './types'

export const COLUMN_CONFIG: Record<Column, {
  label: string
  dotColor: string
  headerColor: string
}> = {
  todo:     { label: 'To Do',       dotColor: 'bg-slate-400',   headerColor: 'text-slate-600' },
  progress: { label: 'In Progress', dotColor: 'bg-blue-500',    headerColor: 'text-blue-600' },
  review:   { label: 'Review',      dotColor: 'bg-amber-500',   headerColor: 'text-amber-600' },
  done:     { label: 'Done',        dotColor: 'bg-emerald-500', headerColor: 'text-emerald-600' },
}

export const TAG_CONFIG: Record<Tag, {
  label: string
  bg: string
  text: string
}> = {
  feature:  { label: 'Feature',  bg: 'bg-violet-50',  text: 'text-violet-700' },
  bug:      { label: 'Bug',      bg: 'bg-rose-50',    text: 'text-rose-700' },
  design:   { label: 'Design',   bg: 'bg-pink-50',    text: 'text-pink-700' },
  research: { label: 'Research', bg: 'bg-sky-50',     text: 'text-sky-700' },
  devops:   { label: 'DevOps',   bg: 'bg-slate-100',  text: 'text-slate-700' },
  other:    { label: 'Other',    bg: 'bg-gray-100',   text: 'text-gray-600' },
}

export const PRIORITY_CONFIG: Record<Priority, {
  label: string
  dot: string
  text: string
}> = {
  urgent: { label: 'Urgent', dot: 'bg-red-500',    text: 'text-red-600' },
  high:   { label: 'High',   dot: 'bg-orange-400', text: 'text-orange-600' },
  medium: { label: 'Medium', dot: 'bg-amber-400',  text: 'text-amber-600' },
  low:    { label: 'Low',    dot: 'bg-slate-300',  text: 'text-slate-500' },
}

export const PROJECT_COLORS: Record<ProjectColor, {
  bg: string
  text: string
  light: string
}> = {
  indigo:  { bg: 'bg-indigo-600',  text: 'text-indigo-600',  light: 'bg-indigo-50' },
  violet:  { bg: 'bg-violet-600',  text: 'text-violet-600',  light: 'bg-violet-50' },
  rose:    { bg: 'bg-rose-600',    text: 'text-rose-600',    light: 'bg-rose-50' },
  amber:   { bg: 'bg-amber-500',   text: 'text-amber-600',   light: 'bg-amber-50' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50' },
  sky:     { bg: 'bg-sky-600',     text: 'text-sky-600',     light: 'bg-sky-50' },
}

export const AVATAR_COLORS = ['indigo', 'violet', 'rose', 'amber', 'emerald', 'sky', 'pink', 'teal'] as const

export const AVATAR_COLOR_CLASSES: Record<string, string> = {
  indigo:  'bg-indigo-100 text-indigo-700',
  violet:  'bg-violet-100 text-violet-700',
  rose:    'bg-rose-100 text-rose-700',
  amber:   'bg-amber-100 text-amber-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  sky:     'bg-sky-100 text-sky-700',
  pink:    'bg-pink-100 text-pink-700',
  teal:    'bg-teal-100 text-teal-700',
}

export const COLUMNS: Column[] = ['todo', 'progress', 'review', 'done']
export const TAGS: Tag[] = ['feature', 'bug', 'design', 'research', 'devops', 'other']
export const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low']
export const PROJECT_COLOR_KEYS: ProjectColor[] = ['indigo', 'violet', 'rose', 'amber', 'emerald', 'sky']
