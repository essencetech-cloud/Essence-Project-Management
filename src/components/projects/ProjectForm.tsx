'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS, PROJECT_COLOR_KEYS } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import type { Project, ProjectColor } from '@/lib/types'

interface ProjectFormProps {
  initialData?: Partial<Project>
  onSubmit: (data: { name: string; description: string; color: ProjectColor }) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

export default function ProjectForm({ initialData, onSubmit, submitLabel = 'Create project', loading }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [color, setColor] = useState<ProjectColor>(initialData?.color ?? 'indigo')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    setError('')
    await onSubmit({ name: name.trim(), description: description.trim(), color })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Mobile App v2.0"
        error={error}
        required
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What is this project about?"
        rows={3}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-gray-700">Project color</label>
        <div className="flex items-center gap-2">
          {PROJECT_COLOR_KEYS.map((c) => {
            const cfg = PROJECT_COLORS[c]
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'h-7 w-7 rounded-full transition-all duration-150 focus-visible:outline-none',
                  cfg.bg,
                  color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-110'
                )}
                aria-label={`Select ${c} color`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
