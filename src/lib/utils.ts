import { clsx, type ClassValue } from 'clsx'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { Task, Column } from './types'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM d')
}

export function formatRelative(date: string): string {
  return formatDistanceToNow(parseISO(date), { addSuffix: true })
}

export function positionBetween(a: number, b: number): number {
  return (a + b) / 2
}

export function getNextPosition(tasks: Task[], column: Column): number {
  const columnTasks = tasks.filter((t) => t.column === column)
  if (columnTasks.length === 0) return 1
  return Math.max(...columnTasks.map((t) => t.position)) + 1
}
