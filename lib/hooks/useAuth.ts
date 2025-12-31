import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/lib/firebase/config'
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
  const [user, loading, error] = useAuthState(auth && mounted ? auth : undefined)

  return { user, loading, error, mounted }
}

