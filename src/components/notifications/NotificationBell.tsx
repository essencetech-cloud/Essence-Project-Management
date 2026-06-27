'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useNotifications } from '@/hooks/useNotifications'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" style={{ height: '1.125rem', width: '1.125rem' }} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Check className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">You&apos;re all caught up!</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn('flex items-start gap-3 px-4 py-3 group', !n.read && 'bg-indigo-50/50')}
                >
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  )}
                  <div className={cn('flex-1 min-w-0', n.read && 'pl-3.5')}>
                    <p className="text-xs font-medium text-gray-800 leading-snug">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatRelative(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        aria-label="Mark read"
                      >
                        <Check className="h-3 w-3" />
                      </button>
                    )}
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => { markRead(n.id); setOpen(false) }}
                        className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="Open"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                    <button
                      onClick={() => dismiss(n.id)}
                      className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Dismiss"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
