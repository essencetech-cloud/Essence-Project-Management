'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TAG_CONFIG, PRIORITY_CONFIG, TAGS, PRIORITIES } from '@/lib/constants'
import Avatar from '@/components/ui/Avatar'
import type { Filters, Tag, Priority, Profile } from '@/lib/types'

interface FilterBarProps {
  filters: Filters
  members: Profile[]
  onChange: (filters: Filters) => void
}

export default function FilterBar({ filters, members, onChange }: FilterBarProps) {
  const hasActiveFilters =
    filters.search !== '' ||
    filters.tag !== '' ||
    filters.priority !== '' ||
    filters.assignee_id !== ''

  const clearFilters = () => {
    onChange({ search: '', tag: '', priority: '', assignee_id: '' })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search tasks…"
          className="h-8 w-52 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent transition-all duration-150"
        />
      </div>

      {/* Tag pills */}
      <div className="flex items-center gap-1">
        {TAGS.map((tag) => {
          const cfg = TAG_CONFIG[tag]
          const active = filters.tag === tag
          return (
            <button
              key={tag}
              onClick={() => onChange({ ...filters, tag: active ? '' : tag as Tag })}
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-medium transition-all duration-150',
                active
                  ? cn(cfg.bg, cfg.text, 'ring-1 ring-current ring-offset-0')
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Priority pills */}
      <div className="flex items-center gap-1">
        {PRIORITIES.map((priority) => {
          const cfg = PRIORITY_CONFIG[priority]
          const active = filters.priority === priority
          return (
            <button
              key={priority}
              onClick={() => onChange({ ...filters, priority: active ? '' : priority as Priority })}
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all duration-150',
                active
                  ? cn('bg-gray-100 text-gray-900')
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', cfg.dot)} />
              {cfg.label}
            </button>
          )
        })}
      </div>

      {/* Assignee avatars */}
      {members.length > 0 && (
        <div className="flex items-center gap-1">
          {members.map((member) => {
            const active = filters.assignee_id === member.id
            return (
              <button
                key={member.id}
                onClick={() => onChange({ ...filters, assignee_id: active ? '' : member.id })}
                className={cn(
                  'rounded-full transition-all duration-150',
                  active ? 'ring-2 ring-indigo-500 ring-offset-1' : 'opacity-60 hover:opacity-100'
                )}
                aria-label={`Filter by ${member.full_name}`}
                title={member.full_name}
              >
                <Avatar name={member.full_name} color={member.avatar_color} size="xs" />
              </button>
            )
          })}
        </div>
      )}

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="h-7 px-2 rounded-md text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 flex items-center gap-1 transition-all duration-150"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  )
}
