import { User } from '../types'

/**
 * Get the redirect path based on user role
 */
export const getRedirectPath = (userData: User | null): string => {
  if (!userData) {
    return '/auth/login'
  }

  if (userData.role === 'admin') {
    return '/admin'
  }

  return '/home'
}

