import { ref, onMounted } from 'vue'
import Papa from 'papaparse'
import type { Game } from '@/types/Game'

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRcx1YPhoi6kUVe36T4T2162AhCdBwuVSX0ou2u-Vlicjf2So3VL3E2MDzrNYIbkgckP4n8p18_UOGP/pub?gid=0&single=true&output=csv'
const CACHE_KEY = 'somer_games_cache'
const CACHE_TIMESTAMP_KEY = 'somer_games_cache_timestamp'
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2 óra milliszekundumban

export function useGameData() {
  const games = ref<Game[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const parseBool = (value: string): boolean => {
    if (!value) return false
    const normalized = value.trim().toUpperCase()
    return normalized === 'IGAZ' || normalized === '1' || normalized === 'TRUE'
  }

  const parseCSVRow = (row: any): Game => {
    return {
      name: row['Játék neve'] || '',
      altNames: row['Játék további elnevezései'] || '',
      goal: row['Gyakorlat célja'] || '',
      rules: row['Játékszabály leírása'] || '',
      materials: row['Szükséges kellékek'] || '',
      source: row['Forrásmegjelölés'] || '',
      
      // Tér
      outdoorSpace: parseBool(row['Kültéren játszható']),
      indoorSpace: parseBool(row['Beltéren játszható']),
      
      // Csoportdinamikai fázis
      groupPhaseForming: parseBool(row['Alakulás']),
      groupPhaseStorming: parseBool(row['Viharzás']),
      groupPhaseNorming: parseBool(row['Normázás']),
      groupPhasePerforming: parseBool(row['Működés']),
      
      // Korosztály
      age0to5: parseBool(row['0-5']),
      age6to10: parseBool(row['6-10']),
      age11to13: parseBool(row['11-13']),
      age14to16: parseBool(row['14-16']),
      age17plus: parseBool(row['17+']),
      
      // Funkció
      function1: row['1.'] || '',
      function2: row['2.'] || '',
      function3: row['3.'] || '',
      
      // Létszám (fő)
      groupSizeSmall: parseBool(row['kis csoport\n3-5 fő']),
      groupSizeMedium: parseBool(row['közepes csoport\n6-15 fő']),
      groupSizeLarge: parseBool(row['nagy csoport\n16-30 fő']),
      groupSizeCommunity: parseBool(row['közösség\n30+ fő']),
      
      // Időtartam
      duration3to10: parseBool(row['3-10p']),
      duration11to20: parseBool(row['11-20p']),
      duration21to30: parseBool(row['21-30p']),
      duration30plus: parseBool(row['30+p'])
    }
  }

  const loadFromCache = (): boolean => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
      
      if (cachedData && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp, 10)
        const now = Date.now()
        
        // Ellenőrizzük, hogy nem járt-e le a cache (2 óra)
        if (now - timestamp < CACHE_DURATION) {
          games.value = JSON.parse(cachedData)
          return true
        }
      }
    } catch (e) {
      console.error('Cache betöltési hiba:', e)
    }
    return false
  }

  const saveToCache = (data: Game[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
    } catch (e) {
      console.error('Cache mentési hiba:', e)
    }
  }

  const fetchGames = async () => {
    loading.value = true
    error.value = null

    // Először próbáljuk meg betölteni a cache-ből
    if (loadFromCache()) {
      loading.value = false
      return
    }
    try {
      const response = await fetch(CSV_URL)
      if (!response.ok) {
        throw new Error('Hiba a CSV betöltésekor')
      }
      
      const csvText = await response.text()
      
      // A CSV-nek 2 fejléc sora van: az első sor kategóriák, a második az igazi fejlécek
      // Az első sort eltávolítjuk, a második lesz a header
      const lines = csvText.split('\n')
      const csvWithoutFirstLine = lines.slice(1).join('\n')
      
      Papa.parse<any>(csvWithoutFirstLine, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          // Az első sor tartalmazza a mezőneveket értékként (ez volt a második fejléc sor)
          // Ezért az első sort is ki kell hagynunk
          const dataRows = results.data.slice(1)
          
          const parsedGames = dataRows.map(parseCSVRow).filter((game: Game) => game.name)
          
          games.value = parsedGames
          saveToCache(parsedGames)
          loading.value = false
        },
        error: (err: Error) => {
          console.error('CSV parse hiba:', err)
          error.value = 'Hiba a CSV feldolgozásakor: ' + err.message
          loading.value = false
        }
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ismeretlen hiba történt'
      loading.value = false
    }
  }

  onMounted(() => {
    fetchGames()
  })

  return {
    games,
    loading,
    error,
    refetch: fetchGames
  }
}
