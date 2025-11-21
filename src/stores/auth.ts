/**
 * Auth Store - Pinia
 * Centralized authentication state management
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/plugins/firebase'
import type { UserProfile } from '@/types/User'
import { handleFirebaseError, logError } from '@/utils/errorHandler'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  
  const isProfileComplete = computed(() => {
    if (!userProfile.value) return false
    
    const hasRequiredFields = 
      userProfile.value.birthDate && 
      userProfile.value.occupation && 
      userProfile.value.institution
    
    // If occupation is "Egyéb", occupationCustom is also required
    if (userProfile.value.occupation === 'Egyéb') {
      return hasRequiredFields && userProfile.value.occupationCustom
    }
    
    return hasRequiredFields
  })

  // Actions
  
  /**
   * Initialize auth state listener
   */
  let authListenerInitialized = false
  
  const initAuthListener = () => {
    if (authListenerInitialized) return
    
    authListenerInitialized = true
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      
      if (firebaseUser) {
        await loadUserProfile(firebaseUser.uid)
      } else {
        userProfile.value = null
      }
      
      loading.value = false
    })
  }

  /**
   * Load user profile from Firestore
   */
  const loadUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        userProfile.value = userDoc.data() as UserProfile

        // Prefetch avatar to avoid stale-cache issues after re-login
        try {
          const url = userProfile.value?.photoURL
          if (url) {
            void fetch(url, { cache: 'reload', mode: 'cors' })
          }
        } catch (e) {
          console.debug('avatar prefetch failed', e)
        }
      }
    } catch (err) {
      // If no permission or user doc doesn't exist, just log it
      logError('loadUserProfile', err)
      error.value = null // Don't show visible error
      userProfile.value = null
    }
  }

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      error.value = null
      const provider = new GoogleAuthProvider()
      
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      
      // Check if user profile exists
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        // Create new user profile
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          phoneNumber: result.user.phoneNumber || '',
          birthDate: '',
          photoURL: result.user.photoURL || '',
          provider: 'google',
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now()
        }
        await setDoc(userDocRef, newProfile)
        
        const savedDoc = await getDoc(userDocRef)
        if (savedDoc.exists()) {
          userProfile.value = savedDoc.data() as UserProfile
        } else {
          console.error('Profile was not saved to Firestore!')
          userProfile.value = newProfile
        }

        // Prefetch avatar after sign-up
        try {
          const url = userProfile.value?.photoURL
          if (url) {
            void fetch(url, { cache: 'reload', mode: 'cors' })
          }
        } catch (e) {
          console.debug('avatar prefetch failed', e)
        }
      } else {
        // Update existing profile (lastLogin)
        const profile = userDoc.data() as UserProfile
        await setDoc(userDocRef, {
          ...profile,
          lastLogin: Timestamp.now()
        })
        userProfile.value = profile

        // Prefetch avatar after login
        try {
          const url = userProfile.value?.photoURL
          if (url) {
            void fetch(url, { cache: 'reload', mode: 'cors' })
          }
        } catch (e) {
          console.debug('avatar prefetch failed', e)
        }
      }
      
      return result.user
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signInWithGoogle', err)
      throw err
    }
  }

  /**
   * Sign out
   */
  const signOut = async () => {
    try {
      error.value = null
      await firebaseSignOut(auth)
      user.value = null
      userProfile.value = null
      
      // Reload page to reset locked content
      window.location.reload()
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signOut', err)
      throw err
    }
  }

  /**
   * Update user profile
   */
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user.value) throw new Error('Nincs bejelentkezve')
    
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    
    // Update local state
    const docSnap = await getDoc(userRef)
    if (docSnap.exists()) {
      userProfile.value = docSnap.data() as UserProfile
    }
  }

  return {
    // State
    user,
    userProfile,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isProfileComplete,
    
    // Actions
    initAuthListener,
    loadUserProfile,
    signInWithGoogle,
    signOut,
    updateUserProfile
  }
})
