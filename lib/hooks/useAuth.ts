import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'

/**
 * Safe wrapper for useAuthState that handles undefined auth
 */
export const useAuth = () => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Only use useAuthState if auth is available and component is mounted
  const auth = getAuthInstance()
  const [user, loading, error] = useAuthState(auth && mounted ? (auth as any) : undefined)

  return { user, loading, error, mounted }
}

