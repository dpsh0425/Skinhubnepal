import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../firebase/config'

// Helper to convert Firestore timestamps
export const convertTimestamp = (timestamp: any) => {
  if (timestamp?.toDate) {
    return timestamp.toDate()
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate()
  }
  return timestamp
}

// Generic get document
export const getDocument = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      // Convert Firestore Timestamps to Date objects
      const processedData: any = { id: docSnap.id }
      for (const [key, value] of Object.entries(data)) {
        if (value && (value instanceof Timestamp || (value as any)?.toDate)) {
          processedData[key] = convertTimestamp(value)
        } else {
          processedData[key] = value
        }
      }
      return processedData as T
    }
    return null
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error)
    return null
  }
}

// Generic get collection
export const getCollection = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const q = query(collection(db, collectionName), ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      // Convert Firestore Timestamps to Date objects
      const processedData: any = { id: doc.id }
      for (const [key, value] of Object.entries(data)) {
        if (value && (value instanceof Timestamp || (value as any)?.toDate)) {
          processedData[key] = convertTimestamp(value)
        } else {
          processedData[key] = value
        }
      }
      return processedData as T
    })
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error)
    return []
  }
}

// Generic create/update document
export const setDocument = async (
  collectionName: string,
  docId: string,
  data: any
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, docId)
    // Remove undefined values (Firestore doesn't allow undefined)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    
    // Convert Date objects to Timestamps
    const processedData = { ...cleanData }
    if (processedData.createdAt instanceof Date) {
      processedData.createdAt = Timestamp.fromDate(processedData.createdAt)
    }
    if (processedData.updatedAt instanceof Date) {
      processedData.updatedAt = Timestamp.fromDate(processedData.updatedAt)
    }
    await setDoc(docRef, {
      ...processedData,
      updatedAt: Timestamp.now(),
    })
    return true
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error)
    return false
  }
}

// Generic update document
export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: any
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, docId)
    // Remove undefined values (Firestore doesn't allow undefined)
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    )
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: Timestamp.now(),
    })
    return true
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error)
    return false
  }
}

// Generic delete document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, collectionName, docId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error)
    return false
  }
}

