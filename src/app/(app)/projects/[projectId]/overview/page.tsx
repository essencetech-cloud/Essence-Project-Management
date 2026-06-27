'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckSquare, FileText, Users, AlertCircle, Archive, TrendingUp } from 'lucide-react'
import ActivityFeed from '@/components/activity/ActivityFeed'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { TAG_CONFIG, PRIORITY_CONFIG } from '@/lib/constants'
import { getDueDateStatus, dueDateClasses } from '@/lib/getDueDateStatus'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ projectId: string }>
}

interface DashboardData {
  stats: {
    totalTasks: number
    doneTasks: number
    archivedTasks: number
    totalDocs: number
    memberCount: number
    overdueTasks: number
    completionRate: number
  }
  columnCounts: Record<string, number>
  myTasks: Array<{
    id: string
    title: string
    column: string
    priority: string
    tag: string
    due_date: string | null
  }>
  recentActivity: Array<{
    id: string
    action: string
    entity_name: string | null
    created_at: string
    user: { id: string; full_name: string; avatar_color: string }
  }>
}

export default function OverviewPage({ params }: Props) {
  const { projectId } = use(params)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/dashboard`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [projectId])

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const { stats, columnCounts, myTasks } = data

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Stats grid */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard icon={CheckSquare}  label="Total Tasks"    value={stats.totalTasks}    color="indigo" />
          <StatCard icon={TrendingUp}   label="Completion"     value={`${stats.completionRate}%`} color="emerald" />
          <StatCard icon={AlertCircle}  label="Overdue"        value={stats.overdueTasks}  color="rose"    highlight={stats.overdueTasks > 0} />
          <StatCard icon={FileText}     label="Docs"           value={stats.totalDocs}     color="sky" />
          <StatCard icon={Users}        label="Members"        value={stats.memberCount}   color="violet" />
          <StatCard icon={Archive}      label="Archived"       value={stats.archivedTasks} color="amber" />
        </div>
      </section>

      {/* Progress by column */}
      <section className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Task Distribution</h2>
        <div className="space-y-3">
          {[
            { key: 'todo',     label: 'To Do',      color: 'bg-gray-400' },
            { key: 'progress', label: 'In Progress', color: 'bg-indigo-500' },
            { key: 'review',   label: 'Review',      color: 'bg-amber-500' },
            { key: 'done',     label: 'Done',        color: 'bg-emerald-500' },
          ].map(({ key, label, color }) => {
            const count = columnCounts[key] ?? 0
            const pct = stats.totalTasks > 0 ? Math.round((count / stats.totalTasks) * 100) : 0
            return (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right flex-shrink-0">{count}</span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My tasks */}
        <section className="bg-white border border-gray-100 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">My Open Tasks</h2>
            <Link href={`/projects/${projectId}/tasks`} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              View all
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No tasks assigned to you.</p>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => {
                const tagCfg = TAG_CONFIG[task.tag as keyof typeof TAG_CONFIG]
                const priorityCfg = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
                const dueDateStatus = getDueDateStatus(task.due_date, task.column)
                return (
                  <div key={task.id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', priorityCfg.dot)} />
                    <Badge className={cn(tagCfg.bg, tagCfg.text, 'text-xs flex-shrink-0')}>{tagCfg.label}</Badge>
                    <p className="flex-1 text-sm text-gray-700 truncate">{task.title}</p>
                    {task.due_date && (
                      <span className={cn('text-xs flex-shrink-0', dueDateClasses(dueDateStatus))}>
                        {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <ActivityFeed projectId={projectId} />
        </section>
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
  highlight?: boolean
}) {
  const styles: Record<string, string> = {
    indigo:  'bg-indigo-50  text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    rose:    'bg-rose-50    text-rose-700',
    sky:     'bg-sky-50     text-sky-700',
    violet:  'bg-violet-50  text-violet-700',
    amber:   'bg-amber-50   text-amber-700',
  }

  return (
    <div className={cn('bg-white border rounded-xl p-4 flex flex-col gap-3', highlight ? 'border-rose-200' : 'border-gray-100')}>
      <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', styles[color])}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className={cn('text-2xl font-semibold', highlight ? 'text-rose-600' : 'text-gray-900')}>{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}
