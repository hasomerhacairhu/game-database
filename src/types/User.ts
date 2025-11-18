import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  phoneNumber?: string
  birthDate: string // YYYY-MM-DD formátum
  photoURL?: string
  provider: 'google' | 'facebook' | 'github'
  createdAt: Timestamp
  lastLogin: Timestamp
  occupation?: string
  occupationCustom?: string
  institution?: string
  updatedAt?: Timestamp
}

export interface UserFavorites {
  uid: string
  games: string[] // Játék ID-k tömbje (Firestore document ID-k)
  updatedAt: Timestamp
}

export interface GameReport {
  id?: string
  userId: string
  userName: string
  userEmail: string
  gameName: string
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  createdAt: Timestamp
  resolvedAt?: Timestamp
  adminNotes?: string
}
