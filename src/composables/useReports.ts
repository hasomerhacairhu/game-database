import { ref, computed } from 'vue'
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore'
import { db } from '@/plugins/firebase'
import { useAuth } from './useAuth'
import type { GameReport } from '@/types/User'
import { handleFirebaseError, logError } from '@/utils/errorHandler'

const reports = ref<GameReport[]>([])
const loading = ref(false)

export function useReports() {
  const { user, userProfile } = useAuth()

  // Hibabejelentés küldése
  const submitReport = async (gameName: string, description: string) => {
    if (!user.value || !userProfile.value) {
      throw new Error('Nincs bejelentkezett felhasználó')
    }

    try {
      loading.value = true

      const report: Omit<GameReport, 'id'> = {
        userId: user.value.uid,
        userName: userProfile.value.displayName || user.value.email || 'Névtelen',
        userEmail: userProfile.value.email || user.value.email || '',
        gameName,
        description,
        status: 'pending',
        createdAt: Timestamp.now()
      }

      const reportsCollection = collection(db, 'reports')
      const docRef = await addDoc(reportsCollection, report)

      return docRef.id
    } catch (err) {
      logError('submitReport', err)
      throw new Error(handleFirebaseError(err))
    } finally {
      loading.value = false
    }
  }

  // User összes bejelentésének lekérése
  const getUserReports = async () => {
    if (!user.value) {
      reports.value = []
      return []
    }

    try {
      loading.value = true
      const reportsCollection = collection(db, 'reports')
      const q = query(
        reportsCollection,
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const userReports: GameReport[] = []

      querySnapshot.forEach((doc) => {
        userReports.push({
          id: doc.id,
          ...doc.data()
        } as GameReport)
      })

      reports.value = userReports
      return userReports
    } catch (err) {
      logError('getUserReports', err)
      reports.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    reports: computed(() => reports.value),
    loading: computed(() => loading.value),
    submitReport,
    getUserReports
  }
}
