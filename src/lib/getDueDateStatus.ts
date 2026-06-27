import { differenceInDays, parseISO, startOfDay } from 'date-fns'

export type DueDateStatus = 'overdue' | 'due-today' | 'due-soon' | 'upcoming' | null

export function getDueDateStatus(dueDate: string | null, column: string): DueDateStatus {
  if (!dueDate || column === 'done') return null
  const today = startOfDay(new Date())
  const due = startOfDay(parseISO(dueDate))
  const diff = differenceInDays(due, today)
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'due-today'
  if (diff <= 2) return 'due-soon'
  return 'upcoming'
}

export function dueDateClasses(status: DueDateStatus): string {
  switch (status) {
    case 'overdue':   return 'text-rose-600 font-medium'
    case 'due-today': return 'text-amber-600 font-medium'
    case 'due-soon':  return 'text-amber-500'
    default:          return 'text-gray-400'
  }
}
