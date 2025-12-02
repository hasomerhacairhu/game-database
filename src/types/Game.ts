/**
 * Game model - Firestore 'games' collection document structure
 * Synced from Google Sheets via n8n workflow
 */
export interface Game {
  // Firestore document ID (auto-generated vagy UUID)
  id?: string
  
  // Alapadatok
  name: string                          // Játék neve (REQUIRED)
  otherNames: string                    // További elnevezések (JSON string array)
  UUID: string                          // Egyedi azonosító
  
  // Leírások
  goal: string                          // Gyakorlat célja
  rules: string                         // Játékszabály leírása
  materials: string                     // Szükséges kellékek (vagy "-" ha nincs)
  
  // Forrás
  sourceName: string                    // Forrás neve (pl. "Cserkészjátékok")
  sourceLink: string                    // Forrás link (Google Drive URL)
  
  // Kategorikus mezők (string array-ek)
  // Minden mező lehet üres array []
  location: string[]                    // ["Kültéren játszható", "Beltéren játszható"]
  groupPhase: string[]                  // ["Alakulás", "Viharzás", "Normázás", "Működés"]
  age: string[]                         // ["0-5", "6-10", "11-13", "14-16", "17+"]
  groupSize: string[]                   // ["3-5 fő", "6-15 fő", "16-30 fő", "30+ fő"]
  length: string[]                      // ["3-10p", "11-20p", "21-30p", "30+p"]
  gameFunction: string[]                // Kategóriák (1-3 db, pl. "Ismerkedős gyakorlatok")
  
  // Értékelések (denormalizált aggregált adatok)
  averageRating?: number                // Átlag értékelés (1-5 csillag) vagy null ha nincs még
  ratingCount?: number                  // Értékelések száma
  
  // Metadata
  status?: Record<string, any>          // Status objektum (lehet üres)
  updateTime?: string                   // ISO 8601 timestamp
}

/**
 * Enum-like constants for filter values
 */
export const LOCATION_OPTIONS = [
  'Kültéren játszható',
  'Beltéren játszható'
] as const

export const GROUP_PHASE_OPTIONS = [
  'Alakulás',
  'Viharzás',
  'Normázás',
  'Működés'
] as const

export const AGE_OPTIONS = [
  '0-5',
  '6-10',
  '11-13',
  '14-16',
  '17+'
] as const

export const GROUP_SIZE_OPTIONS = [
  '3-5 fő',
  '6-15 fő',
  '16-30 fő',
  '30+ fő'
] as const

export const LENGTH_OPTIONS = [
  '3-10p',
  '11-20p',
  '21-30p',
  '30+p'
] as const

// Type helpers
export type Location = typeof LOCATION_OPTIONS[number]
export type GroupPhase = typeof GROUP_PHASE_OPTIONS[number]
export type AgeGroup = typeof AGE_OPTIONS[number]
export type GroupSize = typeof GROUP_SIZE_OPTIONS[number]
export type GameLength = typeof LENGTH_OPTIONS[number]

/**
 * Filter state for game filtering
 */
export interface GameFilterState {
  // Egyszerű szűrő
  simpleSearch: string
  
  // Összetett szűrő (array alapú mezőkhöz)
  advancedSearch: string
  gameFunction: string[]                // Kiválasztott funkciók
  location: string[]                    // Kiválasztott helyszínek
  groupPhase: string[]                  // Kiválasztott fázisok
  age: string[]                         // Kiválasztott korosztályok
  groupSize: string[]                   // Kiválasztott csoportméretek
  length: string[]                      // Kiválasztott időtartamok
}

/**
 * Game Function categories (from Firestore gameFunction array)
 * These are the possible values that can appear in the gameFunction field
 */
export const GAME_FUNCTIONS = [
  'Névtanulós gyakorlatok',
  'Ismerkedős gyakorlatok',
  'Közösségfejlesztő gyakorlatok',
  'Testkontaktus gyakorlatok',
  'Bizalomerősítő gyakorlatok',
  'Empátia gyakorlatok/Érzelmi intelligencia fejlesztő gyakorlatok',
  'Önismereti gyakorlatok',
  'Szituációs játékok',
  'Koncentrációs gyakorlatok',
  'Gondolkodtató gyakorlatok',
  'Mozgás-verseny',
  'Időtöltő játékok',
  'Ugratós játékok',
  'Játékok vetélkedőhöz',
  'Feszültségoldó'
] as const

// Re-export filter constants (for backwards compatibility)
export const FUNCTIONS = GAME_FUNCTIONS
export const SPACES = LOCATION_OPTIONS
export const GROUP_PHASES = GROUP_PHASE_OPTIONS
export const AGE_GROUPS = AGE_OPTIONS

/**
 * Note: groupSize és length values már definiálva vannak fentebb
 * GROUP_SIZE_OPTIONS és LENGTH_OPTIONS néven
 */
