/**
 * Auth Store (new canonical file)
 * Includes avatar cache, inflight dedupe and persistence for small data URLs.
 */
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
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

const AVATAR_CACHE_KEY = 'somer_avatar_cache_v1'
const AVATAR_CACHE_TTL = 1000 * 60 * 60 * 24 * 7 // 7 days
const PERSIST_MAX_BYTES = 50 * 1024

type AvatarEntry = { dataUrl: string; ts: number; source: string; persist?: boolean }

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isProfileComplete = computed(() => {
    const p = userProfile.value as UserProfile | null
    if (!p) return false
    // Consider profile complete when birthDate is present (adjust as needed)
    return !!(p.birthDate && String(p.birthDate).trim() !== '')
  })

  const avatarCache = ref<Record<string, AvatarEntry>>({})
  const avatarFetchInflight = new Map<string, Promise<string | null>>()

  try {
    const raw = localStorage.getItem(AVATAR_CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, AvatarEntry>
      const now = Date.now()
      for (const [k, v] of Object.entries(parsed)) {
        if (now - v.ts < AVATAR_CACHE_TTL) avatarCache.value[k] = v
      }
    }
  } catch (e) {
    logError('auth:loadAvatarCache', e)
  }

  watch(
    avatarCache,
    (next) => {
      try {
        const toPersist: Record<string, AvatarEntry> = {}
        const now = Date.now()
        for (const [k, v] of Object.entries(next)) {
          if (v.persist && now - v.ts < AVATAR_CACHE_TTL) toPersist[k] = v
        }
        localStorage.setItem(AVATAR_CACHE_KEY, JSON.stringify(toPersist))
      } catch (e) {
        logError('auth:saveAvatarCache', e)
      }
    },
    { deep: true }
  )

  function getCachedAvatar(uid: string, remoteUrl?: string | null): string | null {
    if (!uid || !remoteUrl) return null
    const key = `${uid}|${remoteUrl}`
    const entry = avatarCache.value[key]
    if (!entry) return null
    if (Date.now() - entry.ts > AVATAR_CACHE_TTL) {
      delete avatarCache.value[key]
      return null
    }
    return entry.dataUrl
  }

  async function fetchAndCacheAvatar(uid: string, remoteUrl?: string | null): Promise<string | null> {
    if (!uid || !remoteUrl) return null
    const key = `${uid}|${remoteUrl}`
    const existing = avatarCache.value[key]
    if (existing && Date.now() - existing.ts < AVATAR_CACHE_TTL) return existing.dataUrl
    const inflight = avatarFetchInflight.get(key)
    if (inflight) return inflight

    const p = (async (): Promise<string | null> => {
      try {
        const resp = await fetch(remoteUrl, { cache: 'force-cache', mode: 'cors' })
        if (!resp.ok) {
          logError('auth:avatarFetch', new Error(`avatar fetch failed ${resp.status}`))
          return null
        }
        const blob = await resp.blob()
        if (blob.size <= PERSIST_MAX_BYTES) {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader()
            r.onload = () => resolve(String(r.result || ''))
            r.onerror = (e) => reject(e)
            r.readAsDataURL(blob)
          })
          const entry: AvatarEntry = { dataUrl, ts: Date.now(), source: remoteUrl, persist: true }
          avatarCache.value[key] = entry
          return dataUrl
        }
        const objectUrl = URL.createObjectURL(blob)
        const entry: AvatarEntry = { dataUrl: objectUrl, ts: Date.now(), source: remoteUrl, persist: false }
        avatarCache.value[key] = entry
        return objectUrl
      } catch (err) {
        logError('auth:fetchAndCacheAvatar', err)
        return null
      } finally {
        avatarFetchInflight.delete(key)
      }
    })()
    avatarFetchInflight.set(key, p)
    return p
  }

  let authListenerInitialized = false
  const initAuthListener = () => {
    if (authListenerInitialized) return
    authListenerInitialized = true
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser
      if (firebaseUser) {
        try {
          await loadUserProfile(firebaseUser.uid)
        } catch (e) {
          logError('auth:onAuthStateChanged:loadUserProfile', e)
        }
      } else {
        userProfile.value = null
      }
      loading.value = false
    })
  }

  const loadUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userDocRef)
      userProfile.value = userDoc.exists() ? (userDoc.data() as UserProfile) : null
    } catch (err) {
      logError('loadUserProfile', err)
      error.value = null
      userProfile.value = null
    }
  }

  const signInWithGoogle = async () => {
    try {
      error.value = null
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      if (!userDoc.exists()) {
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
        userProfile.value = savedDoc.exists() ? (savedDoc.data() as UserProfile) : newProfile
      } else {
        const profile = userDoc.data() as UserProfile
        await setDoc(userDocRef, { ...profile, lastLogin: Timestamp.now() })
        userProfile.value = profile
      }
      return result.user
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signInWithGoogle', err)
      throw err
    }
  }

  const signOut = async () => {
    try {
      error.value = null
      await firebaseSignOut(auth)
      user.value = null
      userProfile.value = null
      window.location.reload()
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signOut', err)
      throw err
    }
  }

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user.value) throw new Error('Nincs bejelentkezve')
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() })
    const docSnap = await getDoc(userRef)
    if (docSnap.exists()) userProfile.value = docSnap.data() as UserProfile
  }

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated,
    isProfileComplete,
    initAuthListener,
    loadUserProfile,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    getCachedAvatar,
    fetchAndCacheAvatar
  }
})

