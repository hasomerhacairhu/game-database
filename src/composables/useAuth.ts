/**
 * Auth Composable - Wrapper around Pinia Auth Store
 * Provides backward compatibility with existing components
 */

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  
  // Initialize auth listener on first use
  authStore.initAuthListener()
  
  // Use storeToRefs to preserve reactivity when destructuring
  const { user, userProfile, isAuthenticated, isProfileComplete, loading, error } = storeToRefs(authStore)
  
  return {
    user,
    userProfile,
    isAuthenticated,
    isProfileComplete,
    loading,
    error,
    signInWithGoogle: authStore.signInWithGoogle,
    signOut: authStore.signOut,
    updateUserProfile: authStore.updateUserProfile,
    loadUserProfile: authStore.loadUserProfile
  }
}
