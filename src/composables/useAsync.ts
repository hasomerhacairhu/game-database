/**
 * useAsync - Async state management helper
 * Simplifies loading state, error handling for async operations
 */

import { ref } from 'vue'
import { handleFirebaseError } from '@/utils/errorHandler'

export interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export interface UseAsyncReturn<T> {
  loading: ReturnType<typeof ref<boolean>>
  error: ReturnType<typeof ref<string | null>>
  data: ReturnType<typeof ref<T | null | undefined>>
  execute: () => Promise<void>
  reset: () => void
}

/**
 * Wraps an async function with loading state and error handling
 * 
 * @example
 * const { loading, error, execute } = useAsync(
 *   async () => await saveFavorite(gameId),
 *   {
 *     onSuccess: () => showSuccess('Mentve!'),
 *     onError: () => showError('Hiba történt')
 *   }
 * )
 */
export function useAsync<T>(
  asyncFn: () => Promise<T>,
  options?: UseAsyncOptions<T>
): UseAsyncReturn<T> {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<T | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await asyncFn()
      options?.onSuccess?.(data.value)
    } catch (err) {
      const errorMessage = handleFirebaseError(err)
      error.value = errorMessage
      options?.onError?.(err as Error)
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  if (options?.immediate) {
    execute()
  }

  return {
    loading,
    error,
    data: data as ReturnType<typeof ref<T | null | undefined>>,
    execute,
    reset
  }
}

/**
 * Helper for multiple sequential async operations
 * 
 * @example
 * const { loading, error, execute } = useAsyncSequence([
 *   async () => await step1(),
 *   async () => await step2(),
 *   async () => await step3()
 * ])
 */
export function useAsyncSequence(
  asyncFns: Array<() => Promise<any>>,
  options?: UseAsyncOptions<void>
) {
  return useAsync(async () => {
    for (const fn of asyncFns) {
      await fn()
    }
  }, options)
}

/**
 * Helper for parallel async operations
 * 
 * @example
 * const { loading, error, execute } = useAsyncParallel([
 *   async () => await fetchGames(),
 *   async () => await fetchFavorites(),
 *   async () => await fetchTriedGames()
 * ])
 */
export function useAsyncParallel<T>(
  asyncFns: Array<() => Promise<T>>,
  options?: UseAsyncOptions<T[]>
) {
  return useAsync(async () => {
    return await Promise.all(asyncFns.map(fn => fn()))
  }, options)
}
