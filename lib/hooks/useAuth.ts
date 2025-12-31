import { useAuthState } from 'react-firebase-hooks/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { useEffect, useState } from 'react'
import { User as FirebaseUser } from 'firebase/auth'

/**
 * Safe wrapper for useAuthState that handles undefined auth and SSR
 */
export const useAuth = () => {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | undefined>(undefined)
  
  useEffect(() => {
    setMounted(true)
    
    // Only initialize auth after mount (client-side only)
    if (typeof window === 'undefined') return
    
    const auth = getAuthInstance()
    if (!auth) {
      setLoading(false)
      return
    }

    // Use useAuthState only on client side
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
        setError(undefined)
      },
      (err) => {
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  return { user, loading, error, mounted }
}

