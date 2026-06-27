'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'

interface UseAuthReturn {
  user: Profile | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        setProfile(null)
      }
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setProfile(null)
    router.push('/login')
  }

  return { user: profile, profile, loading, signOut }
}
