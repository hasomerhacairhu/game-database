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
    return value?.trim().toLowerCase() === 'igaz' || value?.trim() === '1' || value?.trim().toLowerCase() === 'true'
  }

  let loggedKeys = false
  
  const parseCSVRow = (row: any): Game => {
    // Debug: log először az összes kulcsot (csak egyszer)
    if (!loggedKeys && Object.keys(row).length > 0) {
      console.log('CSV sor kulcsok:', Object.keys(row))
      console.log('Első sor értékek:', row)
      loggedKeys = true
    }
    
    return {
      name: row['Játék neve'] || '',
      altNames: row['Játék további elnevezései'] || '',
      goal: row['Gyakorlat célja'] || '',
      rules: row['Játékszabály leírása'] || '',
      materials: row['Szükséges kellékek'] || '',
      source: row['Forrásmegjelölés'] || '',
      
      outdoorSpace: parseBool(row['Tér - Kültéren játszható']),
      indoorSpace: parseBool(row['Tér - Beltéren játszható']),
      
      groupPhaseForming: parseBool(row['Csoportdinamikai fázis - Alakulás']),
      groupPhaseStorming: parseBool(row['Csoportdinamikai fázis - Viharzás']),
      groupPhaseNorming: parseBool(row['Csoportdinamikai fázis - Normázás']),
      groupPhasePerforming: parseBool(row['Csoportdinamikai fázis - Működés']),
      
      age0to5: parseBool(row['Korosztály - 0-5']),
      age6to10: parseBool(row['Korosztály - 6-10']),
      age11to13: parseBool(row['Korosztály - 11-13']),
      age14to16: parseBool(row['Korosztály - 14-16']),
      age17plus: parseBool(row['Korosztály - 17+']),
      
      function1: row['Funkció\t- 1.'] || '',
      function2: row['Funkció\t- 2.'] || '',
      function3: row['Funkció\t- 3.'] || '',
      
      groupSizeSmall: parseBool(row['Létszám - "kis csoport 3-5 fő"']),
      groupSizeMedium: parseBool(row['Létszám - "közepes csoport 6-15 fő"']),
      groupSizeLarge: parseBool(row['Létszám - "nagy csoport 16-30 fő"']),
      groupSizeCommunity: parseBool(row['Létszám - "közösség 30+ fő"']),
      
      duration3to10: parseBool(row['Időtartam - 3-10p']),
      duration11to20: parseBool(row['Időtartam - 11-20p']),
      duration21to30: parseBool(row['Időtartam - 21-30p']),
      duration30plus: parseBool(row['Időtartam - 30+p'])
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
    console.log('fetchGames indult')
    loading.value = true
    error.value = null

    // Debug: Cache törlése fejlesztés közben
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    console.log('Cache törölve')

    // Először próbáljuk meg betölteni a cache-ből
    // if (loadFromCache()) {
    //   console.log('Adatok betöltve cache-ből, játékok száma:', games.value.length)
    //   loading.value = false
    //   return
    // }

    console.log('Cache-ben nincs adat, letöltés indítása...')
    try {
      const response = await fetch(CSV_URL)
      console.log('Fetch response status:', response.status)
      if (!response.ok) {
        throw new Error('Hiba a CSV betöltésekor')
      }
      
      const csvText = await response.text()
      console.log('CSV szöveg hossza:', csvText.length)
      console.log('CSV első 500 karakter:', csvText.substring(0, 500))
      
      // A CSV-nek 2 fejléc sora van, az első sor kategóriák, a második az igazi fejlécek
      // Távolítsuk el az első sort
      const lines = csvText.split('\n')
      const csvWithoutFirstLine = lines.slice(1).join('\n')
      console.log('CSV első sor eltávolítva, új első 300 karakter:', csvWithoutFirstLine.substring(0, 300))
      
      Papa.parse<any>(csvWithoutFirstLine, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => {
          console.log('CSV Parse eredmény:', results)
          console.log('Első sor:', results.data[0])
          console.log('Mezők:', results.meta?.fields)
          
          const parsedGames = results.data.map(parseCSVRow).filter((game: Game) => game.name)
          console.log('Parsed games száma:', parsedGames.length)
          console.log('Első játék:', parsedGames[0])
          
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
