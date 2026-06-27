'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, CheckSquare, FileText, FolderOpen, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useGlobalSearch } from '@/hooks/useGlobalSearch'
import { PROJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { ProjectColor } from '@/lib/types'

export default function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const { query, setQuery, results, loading, clear, totalCount } = useGlobalSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
      if (e.key === 'Escape') { setOpen(false); clear() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [clear])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false); clear()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [clear])

  const handleClose = () => { setOpen(false); clear() }

  const colorDot = (color: string) => {
    const cfg = PROJECT_COLORS[color as ProjectColor] ?? PROJECT_COLORS.indigo
    return <span className={cn('h-2 w-2 rounded-full flex-shrink-0', cfg.bg)} />
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
        aria-label="Search"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:block">Search…</span>
        <kbd className="hidden sm:block ml-1 text-xs bg-gray-100 text-gray-400 px-1 rounded">⌘K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div ref={containerRef} className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              {loading ? (
                <Loader2 className="h-4 w-4 text-gray-400 animate-spin flex-shrink-0" />
              ) : (
                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, docs, projects…"
                className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.length >= 2 && !loading && totalCount === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">No results for &ldquo;{query}&rdquo;</div>
              )}

              {results.projects.length > 0 && (
                <Section label="Projects">
                  {results.projects.map((p) => (
                    <ResultRow
                      key={p.id}
                      href={`/projects/${p.id}/overview`}
                      icon={<FolderOpen className="h-3.5 w-3.5 text-gray-400" />}
                      title={p.name}
                      suffix={colorDot(p.color)}
                      onClose={handleClose}
                    />
                  ))}
                </Section>
              )}

              {results.tasks.length > 0 && (
                <Section label="Tasks">
                  {results.tasks.map((t) => (
                    <ResultRow
                      key={t.id}
                      href={`/projects/${t.project.id}/tasks`}
                      icon={<CheckSquare className="h-3.5 w-3.5 text-gray-400" />}
                      title={t.title}
                      subtitle={t.project.name}
                      suffix={colorDot(t.project.color)}
                      onClose={handleClose}
                    />
                  ))}
                </Section>
              )}

              {results.docs.length > 0 && (
                <Section label="Docs">
                  {results.docs.map((d) => (
                    <ResultRow
                      key={d.id}
                      href={`/projects/${d.project.id}/docs/${d.id}`}
                      icon={<FileText className="h-3.5 w-3.5 text-gray-400" />}
                      title={d.title}
                      subtitle={d.project.name}
                      suffix={colorDot(d.project.color)}
                      onClose={handleClose}
                    />
                  ))}
                </Section>
              )}

              {!query && (
                <div className="py-6 text-center text-sm text-gray-400">Start typing to search…</div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
              <span><kbd className="bg-gray-100 px-1 rounded">Esc</kbd> to close</span>
              <span><kbd className="bg-gray-100 px-1 rounded">Enter</kbd> to navigate</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
        {label}
      </div>
      {children}
    </div>
  )
}

function ResultRow({
  href, icon, title, subtitle, suffix, onClose,
}: {
  href: string
  icon: React.ReactNode
  title: string
  subtitle?: string
  suffix?: React.ReactNode
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
    >
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
      </div>
      {suffix}
    </Link>
  )
}
