'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ProjectRole, SystemRole, Action } from '@/lib/permissions'
import { can } from '@/lib/permissions'

interface ProjectPermissions {
  projectRole: ProjectRole | null
  systemRole: SystemRole
  can: (action: Action) => boolean
  loading: boolean
}

const cache = new Map<string, { projectRole: ProjectRole | null; systemRole: SystemRole }>()

export function useProjectPermissions(projectId: string): ProjectPermissions {
  const [projectRole, setProjectRole] = useState<ProjectRole | null>(null)
  const [systemRole, setSystemRole] = useState<SystemRole>('MEMBER')
  const [loading, setLoading] = useState(true)

  const fetch_ = useCallback(async () => {
    const cached = cache.get(projectId)
    if (cached) {
      setProjectRole(cached.projectRole)
      setSystemRole(cached.systemRole)
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`/api/projects/${projectId}/my-role`)
      if (res.ok) {
        const data = await res.json()
        cache.set(projectId, data)
        setProjectRole(data.projectRole)
        setSystemRole(data.systemRole)
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetch_() }, [fetch_])

  const canDo = useCallback(
    (action: Action) => can(action, projectRole, systemRole),
    [projectRole, systemRole]
  )

  return useMemo(
    () => ({ projectRole, systemRole, can: canDo, loading }),
    [projectRole, systemRole, canDo, loading]
  )
}
