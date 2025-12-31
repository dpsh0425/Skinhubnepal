import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

// Initialize Firebase only on client side
if (typeof window !== 'undefined') {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
    } else {
      app = getApps()[0]
    }
    if (app) {
      auth = getAuth(app)
      db = getFirestore(app)
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

// Export with fallback check - this ensures auth is always available when used
export const getAuthInstance = (): Auth | undefined => {
  if (typeof window === 'undefined') return undefined
  if (!auth && app) {
    auth = getAuth(app)
  }
  return auth
}

export const getDbInstance = (): Firestore | undefined => {
  if (typeof window === 'undefined') return undefined
  if (!db && app) {
    db = getFirestore(app)
  }
  return db
}

// Export the instances (will be undefined on server, defined on client)
export { auth, db }
export default app

