import { ref, onMounted, onUnmounted } from 'vue'

const occupations = [
  'ifjúsági vezetők',
  'tanárok',
  'drámainstruktorok',
  'cserkészek',
  'coachok',
  'trénerek',
  'madrihok',
  'pedagógusok',
  'pszichológusok',
  'animátorok',
  'táborvezetők',
  'közösségszervezők',
  'edzők',
  'színjátszók'
]

export function useOccupationRotation(intervalMs = 5000) {
  const currentOccupation = ref(occupations[0])
  let intervalId: number | undefined

  const getRandomOccupation = () => {
    const available = occupations.filter(o => o !== currentOccupation.value)
    const idx = Math.floor(Math.random() * available.length)
    return available[idx]
  }

  onMounted(() => {
    intervalId = window.setInterval(() => {
      currentOccupation.value = getRandomOccupation()
    }, intervalMs)
  })

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return { currentOccupation }
}
