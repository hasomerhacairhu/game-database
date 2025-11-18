/**
 * Error handling utility for Firebase and general errors
 */

export interface FirebaseError extends Error {
  code?: string
  customData?: any
}

/**
 * Converts unknown error types to user-friendly error messages
 * @param error - The error to handle
 * @returns User-friendly error message
 */
export function handleFirebaseError(error: unknown): string {
  // Firebase Error with message
  if (error instanceof Error) {
    return error.message
  }
  
  // String error
  if (typeof error === 'string') {
    return error
  }
  
  // Object with message property
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  // Fallback
  return 'Ismeretlen hiba történt'
}

/**
 * Logs error to console with additional context
 * @param context - Context where the error occurred
 * @param error - The error to log
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
  
  // In production, you could send this to a logging service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Extracts Firebase error code if available
 * @param error - The error to extract code from
 * @returns Firebase error code or null
 */
export function getFirebaseErrorCode(error: unknown): string | null {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  return null
}

/**
 * Maps Firebase error codes to user-friendly messages
 * @param code - Firebase error code
 * @returns User-friendly error message
 */
export function getFirebaseErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': 'A felhasználó nem található',
    'auth/wrong-password': 'Hibás jelszó',
    'auth/email-already-in-use': 'Ez az email cím már használatban van',
    'auth/weak-password': 'A jelszó túl gyenge',
    'auth/invalid-email': 'Érvénytelen email cím',
    'auth/operation-not-allowed': 'Ez a művelet nem engedélyezett',
    'auth/account-exists-with-different-credential': 'Már létezik fiók ezzel az email címmel',
    'permission-denied': 'Nincs jogosultságod ehhez a művelethez',
    'not-found': 'A kért erőforrás nem található',
    'already-exists': 'Ez az elem már létezik',
    'unauthenticated': 'Kérjük jelentkezz be',
  }
  
  return errorMessages[code] || 'Hiba történt a művelet végrehajtása során'
}
