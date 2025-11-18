<template>
  <v-app-bar 
    color="primary" 
    elevation="2" 
    :height="scrolled ? 70 : 120"
    scroll-behavior="elevate"
    class="header-bar"
  >
    <v-container class="header-content">
      <div class="d-flex align-center" :style="{ height: scrolled ? '70px' : '120px', transition: 'all 0.4s ease' }">
        <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="logo-link mr-4">
          <v-img
            :src="logoUrl"
            alt="Somer Logo"
            :width="scrolled ? 40 : 80"
            :max-width="scrolled ? 40 : 80"
            style="transition: all 0.4s ease;"
          ></v-img>
        </a>
        
        <div class="title-container">
          <div :class="scrolled ? 'text-h5' : 'text-h3'" class="main-title">
            JÁTÉKADATBÁZIS
          </div>
          <div 
            v-show="!scrolled" 
            class="subtitle"
          >
            <span class="subtitle-grid">
              <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="grid-item subtitle-link">A Hasomer Hacair nagy játékgyűjteménye</a>
              <span class="grid-item occupation-cell">
                <Transition name="flip" mode="out-in">
                  <span :key="currentOccupation" class="occupation">{{ currentOccupation }}</span>
                </Transition>
              </span>
              <span class="grid-item">részére.</span>
            </span>
          </div>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center gap-3">
          <v-btn
            v-if="!isAuthenticated"
            href="https://somer.hu"
            target="_blank"
            color="white"
            variant="outlined"
            size="default"
            class="header-btn"
          >
            <v-icon start>mdi-open-in-new</v-icon>
            <span v-if="!scrolled || $vuetify.display.mdAndUp">Ugrás a somer.hu-ra</span>
            <span v-else>Somer.hu</span>
          </v-btn>

          <UserMenu @show-favorites="$emit('show-favorites')" />
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import logoSvg from '@/assets/somer-semel-white-with-transparent-bg.svg'
import UserMenu from './UserMenu.vue'

defineEmits<{
  'show-favorites': []
}>()

const { isAuthenticated } = useAuth()
const logoUrl = logoSvg
const scrolled = ref(false)

// Foglalkozások listája (random sorrendben váltakoznak)
const occupations = [
  'ifjúsági vezetők',
  'tanárok',
  'drámainstruktorok',
  'cserkészek',
  'coachok',
  'trénerek',
  'madrihok',
  'pedagógusok',
  'animátorok',
  'táborvezetők',
  'közösségszervezők',
  'edzők',
  'színjátszók'
]

const currentOccupation = ref(occupations[0])
let occupationInterval: number | null = null

// Random foglalkozás választása (nem lehet ugyanaz, mint az előző)
const getRandomOccupation = () => {
  const availableOccupations = occupations.filter(occ => occ !== currentOccupation.value)
  const randomIndex = Math.floor(Math.random() * availableOccupations.length)
  return availableOccupations[randomIndex]
}

let lastScrollY = 0

const handleScroll = () => {
  const currentScrollY = window.scrollY
  
  // Ha lefelé görgettünk (scrollY > 50), állítsuk be scrolled = true
  if (currentScrollY > 50) {
    scrolled.value = true
    lastScrollY = currentScrollY
  }
  // Csak akkor álljon vissza false-ra, ha:
  // 1. ScrollY <= 50 (az oldal tetején vagyunk)
  // 2. És az előző scrollY is <= 50 volt (nem ugrott vissza 0-ra dialóg miatt)
  else if (currentScrollY <= 50 && lastScrollY <= 50) {
    scrolled.value = false
  }
  
  // Ha a scrollY jelentősen csökkent (több mint 100px), valószínűleg dialog nyílt meg
  // Ilyenkor ne frissítsük a lastScrollY-t
  if (Math.abs(currentScrollY - lastScrollY) < 100 || currentScrollY > lastScrollY) {
    lastScrollY = currentScrollY
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // 5 másodpercenként váltson foglalkozást
  occupationInterval = window.setInterval(() => {
    currentOccupation.value = getRandomOccupation()
  }, 5000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (occupationInterval) {
    clearInterval(occupationInterval)
  }
})
</script>

<style scoped>
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.4s ease;
}

.title-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.4s ease;
}

.main-title {
  color: white;
  font-family: 'Myriad Pro Black Italic', sans-serif !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
  transition: all 0.4s ease;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Myriad Pro Regular', sans-serif !important;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  line-height: 1.3;
  max-width: 600px;
  transition: opacity 0.4s ease, transform 0.4s ease;
  opacity: 1;
  transform: translateY(0);
}

.subtitle.v-leave-active {
  opacity: 0;
  transform: translateY(-10px);
}

.subtitle-grid {
  display: inline-grid;
  grid-template-columns: auto auto auto;
  gap: 0.25em;
  align-items: baseline;
}

.grid-item {
  white-space: nowrap;
}

.occupation-cell {
  display: grid;
  transition: width 0.4s ease;
}

.occupation {
  grid-column: 1;
  grid-row: 1;
  display: inline-block;
  font-weight: 600;
  color: rgba(255, 255, 255, 1);
  white-space: nowrap;
}

/* Flip animáció - egyszerűbb fade effekt */
.flip-enter-active,
.flip-leave-active {
  transition: all 0.4s ease;
}

.flip-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}

.flip-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.flip-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.flip-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.gap-3 {
  gap: 12px;
}

.header-btn {
  transition: all 0.3s ease;
  min-height: 40px;
}

.logo-link {
  display: inline-block;
  cursor: pointer;
}

.subtitle-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.subtitle-link:hover {
  text-decoration: none;
}
</style>
