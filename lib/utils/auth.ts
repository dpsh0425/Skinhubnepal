import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '../firebase/config'
import { setDocument, getDocument } from './firestore'
import { User } from '../types'

export const signUp = async (
  email: string,
  password: string,
  name: string
): Promise<{ user: FirebaseUser | null; error: string | null }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      email: user.email || '',
      name,
      role: 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      addresses: [],
    }

    await setDocument('users', user.uid, userData)

    return { user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

export const login = async (
  email: string,
  password: string
): Promise<{ user: FirebaseUser | null; userData: User | null; error: string | null }> => {
  try {
    if (!auth) {
      return { user: null, userData: null, error: 'Firebase auth not initialized' }
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    
    // Get user data from Firestore to check role
    // Use try-catch to handle Firestore errors gracefully
    let userData: User | null = null
    try {
      userData = await getUserData(user.uid)
    } catch (firestoreError) {
      console.warn('Could not fetch user data from Firestore:', firestoreError)
      // Continue without userData - will default to customer
    }
    
    return { user, userData, error: null }
  } catch (error: any) {
    return { user: null, userData: null, error: error.message }
  }
}

export const logout = async (): Promise<void> => {
  if (auth) {
    await signOut(auth)
  }
}

export const resetPassword = async (email: string): Promise<{ error: string | null }> => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const getUserData = async (userId: string): Promise<User | null> => {
  return await getDocument<User>('users', userId)
}

