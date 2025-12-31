'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { getAuthInstance } from '@/lib/firebase/config'
import { getUserData } from '@/lib/utils/auth'
import Link from 'next/link'
import { login } from '@/lib/utils/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { User as FirebaseUser } from 'firebase/auth'

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Listen to auth state changes
  useEffect(() => {
    const auth = getAuthInstance()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    const auth = getAuthInstance()
    if (loading || !auth || isLoading) return // Don't redirect while logging in
    
    const checkUserAndRedirect = async () => {
      if (user) {
        try {
          const userData = await getUserData(user.uid)
          if (userData) {
            if (userData.role === 'admin') {
              router.replace('/admin')
            } else {
              router.replace('/home')
            }
          } else {
            // No userData, default to customer
            router.replace('/home')
          }
        } catch (error) {
          // If we can't get userData, still redirect to home
          router.replace('/home')
        }
      }
    }
    checkUserAndRedirect()
  }, [user, loading, router, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { user: loggedInUser, userData, error } = await login(email, password)

      if (error) {
        toast.error(error)
        setIsLoading(false)
        return
      }

      if (loggedInUser) {
        toast.success('Logged in successfully!')
        setIsLoading(false)
        
        // Simple redirect: check email first, then userData
        if (loggedInUser.email === 'admin@skinhubnepal.com') {
          // Admin email - redirect to admin panel
          window.location.href = '/admin'
        } else if (userData && userData.role === 'admin') {
          // Admin role from Firestore
          window.location.href = '/admin'
        } else {
          // Customer - redirect to home
          router.replace('/home')
        }
      } else {
        setIsLoading(false)
      }
    } catch (error: any) {
      toast.error('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skincare-light">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-skincare-light px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-600">
          SkinHub Nepal
        </h1>
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />

          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
