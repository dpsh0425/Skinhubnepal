'use client'

import { useState } from 'react'
import Link from 'next/link'
import { resetPassword } from '@/lib/utils/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      toast.error(error)
      setIsLoading(false)
      return
    }

    toast.success('Password reset email sent!')
    setSent(true)
    setIsLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-skincare-light px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-8 text-primary-600">
            SkinHub Nepal
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Check your email</h2>
          <p className="text-gray-600 mb-6">
            We've sent a password reset link to {email}
          </p>
          <Link href="/auth/login">
            <Button>Back to Login</Button>
          </Link>
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
        <h2 className="text-2xl font-semibold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

