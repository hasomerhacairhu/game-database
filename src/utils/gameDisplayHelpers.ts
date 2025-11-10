import type { Game } from '@/types/Game'

export function getSpaceDisplay(game: Game): string {
  const spaces: string[] = []
  if (game.outdoorSpace) spaces.push('Kültér')
  if (game.indoorSpace) spaces.push('Beltér')
  return spaces.join(', ') || '-'
}

export function getGroupPhaseDisplay(game: Game): string {
  const phases: string[] = []
  if (game.groupPhaseForming) phases.push('Alakulás')
  if (game.groupPhaseStorming) phases.push('Viharzás')
  if (game.groupPhaseNorming) phases.push('Normázás')
  if (game.groupPhasePerforming) phases.push('Működés')
  return phases.join(', ') || '-'
}

export function getAgeGroupDisplay(game: Game): string {
  const ages: string[] = []
  if (game.age0to5) ages.push('0-5')
  if (game.age6to10) ages.push('6-10')
  if (game.age11to13) ages.push('11-13')
  if (game.age14to16) ages.push('14-16')
  if (game.age17plus) ages.push('17+')
  return ages.join(', ') || '-'
}

export function getGroupSizeDisplay(game: Game): string {
  const sizes: string[] = []
  if (game.groupSizeSmall) sizes.push('3-5')
  if (game.groupSizeMedium) sizes.push('6-15')
  if (game.groupSizeLarge) sizes.push('16-30')
  if (game.groupSizeCommunity) sizes.push('30+')
  return sizes.join(', ') || '-'
}

export function getDurationDisplay(game: Game): string {
  const durations: string[] = []
  if (game.duration3to10) durations.push('3-10p')
  if (game.duration11to20) durations.push('11-20p')
  if (game.duration21to30) durations.push('21-30p')
  if (game.duration30plus) durations.push('30+p')
  return durations.join(', ') || '-'
}
