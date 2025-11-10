export interface Game {
  // Alapadatok
  name: string
  altNames: string
  goal: string
  rules: string
  materials: string
  source: string
  
  // Tér (bool)
  outdoorSpace: boolean
  indoorSpace: boolean
  
  // Csoportdinamikai fázis (bool)
  groupPhaseForming: boolean
  groupPhaseStorming: boolean
  groupPhaseNorming: boolean
  groupPhasePerforming: boolean
  
  // Korosztály (bool)
  age0to5: boolean
  age6to10: boolean
  age11to13: boolean
  age14to16: boolean
  age17plus: boolean
  
  // Funkció (enum - legfeljebb 3)
  function1: string
  function2: string
  function3: string
  
  // Létszám (bool)
  groupSizeSmall: boolean    // 3-5 fő
  groupSizeMedium: boolean   // 6-15 fő
  groupSizeLarge: boolean    // 16-30 fő
  groupSizeCommunity: boolean // 30+ fő
  
  // Időtartam (bool)
  duration3to10: boolean
  duration11to20: boolean
  duration21to30: boolean
  duration30plus: boolean
}

export interface GameFilterState {
  // Egyszerű szűrő
  simpleSearch: string
  
  // Összetett szűrő
  advancedSearch: string
  functions: string[]
  spaces: string[]
  groupPhases: string[]
  ageGroups: string[]
  groupSizes: string[]
  durations: string[]
}

// Enum-ok a szűrőkhöz
export const FUNCTIONS = [
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

export const SPACES = [
  'Kültéren játszható',
  'Beltéren játszható'
] as const

export const GROUP_PHASES = [
  'Alakulás',
  'Viharzás',
  'Normázás',
  'Működés'
] as const

export const AGE_GROUPS = [
  '0-5',
  '6-10',
  '11-13',
  '14-16',
  '17+'
] as const

export const GROUP_SIZES = [
  'Kis csoport (3-5 fő)',
  'Közepes csoport (6-15 fő)',
  'Nagy csoport (16-30 fő)',
  'Közösség (30+ fő)'
] as const

export const DURATIONS = [
  '3-10 perc',
  '11-20 perc',
  '21-30 perc',
  '30+ perc'
] as const
