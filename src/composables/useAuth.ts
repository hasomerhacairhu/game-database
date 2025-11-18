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

const user = ref<User | null>(null)
const userProfile = ref<UserProfile | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Auth state listener - csak egyszer regisztráljuk
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

// User profil betöltése Firestore-ból
const loadUserProfile = async (uid: string) => {
  try {
    const userDocRef = doc(db, 'users', uid)
    const userDoc = await getDoc(userDocRef)
    
    if (userDoc.exists()) {
      userProfile.value = userDoc.data() as UserProfile
    }
  } catch (err) {
    // Ha nincs jogosultság vagy nem létezik a user doc, csak logoljuk, ne dobjunk errort
    logError('loadUserProfile', err)
    error.value = null // Ne legyen látható hiba
    userProfile.value = null
  }
}

export function useAuth() {
  // Auth listener inicializálása (csak egyszer)
  initAuthListener()
  
  const isAuthenticated = computed(() => !!user.value)

  // Google bejelentkezés
  const signInWithGoogle = async () => {
    try {
      error.value = null
      const provider = new GoogleAuthProvider()
      
      // Custom parameters hozzáadása a jobb kompatibilitásért
      provider.setCustomParameters({
        prompt: 'select_account'
      })
      
      const result = await signInWithPopup(auth, provider)
      
      // Ellenőrizzük, létezik-e már a user profil
      const userDocRef = doc(db, 'users', result.user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        // Új user profil létrehozása
        const newProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || '',
          phoneNumber: result.user.phoneNumber || '',
          birthDate: '', // Ezt később töltik ki
          photoURL: result.user.photoURL || '',
          provider: 'google',
          createdAt: Timestamp.now(),
          lastLogin: Timestamp.now()
        }
        await setDoc(userDocRef, newProfile)
        
        // Ellenőrizzük hogy tényleg létrejött-e
        const savedDoc = await getDoc(userDocRef)
        if (savedDoc.exists()) {
          userProfile.value = savedDoc.data() as UserProfile
        } else {
          console.error('Profile was not saved to Firestore!')
          userProfile.value = newProfile
        }
      } else {
        // Meglévő profil frissítése (lastLogin)
        const profile = userDoc.data() as UserProfile
        await setDoc(userDocRef, {
          ...profile,
          lastLogin: Timestamp.now()
        })
        userProfile.value = profile
      }
      
      return result.user
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signInWithGoogle', err)
      throw err
    }
  }

  // Kijelentkezés
  const signOut = async () => {
    try {
      error.value = null
      await firebaseSignOut(auth)
      user.value = null
      userProfile.value = null
      
      // Oldal frissítése, hogy a lockolt tartalom is töltődjön
      window.location.reload()
    } catch (err) {
      error.value = handleFirebaseError(err)
      logError('signOut', err)
      throw err
    }
  }

  // User profil frissítése
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user.value) throw new Error('Nincs bejelentkezve')
    
    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    
    // Lokális state frissítése
    const docSnap = await getDoc(userRef)
    if (docSnap.exists()) {
      userProfile.value = docSnap.data() as UserProfile
    }
  }

  // Ellenőrzi, hogy a profil ki van-e töltve (születési dátum kötelező)
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

  return {
    user: computed(() => user.value),
    userProfile: computed(() => userProfile.value),
    isAuthenticated,
    isProfileComplete,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    signInWithGoogle,
    signOut,
    updateUserProfile,
    loadUserProfile
  }
}
