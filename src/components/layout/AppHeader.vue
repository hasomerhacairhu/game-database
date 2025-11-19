<template>
  <v-app-bar 
    color="primary" 
    elevation="2" 
    :height="headerHeight"
    scroll-behavior="elevate"
    class="header-bar"
  >
    <div class="header-overlay" :class="{ 'header-overlay-scrolled': scrolled }"></div>
    <v-container class="header-content">
      <div class="d-flex align-center" :style="{ height: headerHeight + 'px', transition: 'all 0.4s ease' }">
        <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="logo-link mr-4">
          <v-img
            :src="logoUrl"
            alt="Somer Logo"
            :width="logoSize"
            :max-width="logoSize"
            style="transition: all 0.4s ease;"
          ></v-img>
        </a>
        
        <div class="title-container" :class="{ 'title-container-scrolled': scrolled }">
          <div :class="titleClasses">
            JÁTÉKADATBÁZIS
          </div>
          <Transition name="subtitle">
            <div 
              v-if="!scrolled" 
              class="subtitle"
            >
              <span v-if="!isMobile" class="subtitle-grid">
                <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="grid-item subtitle-link">A Hasomer Hacair nagy játékgyűjteménye</a>
                <span class="grid-item occupation-cell">
                  <Transition name="flip" mode="out-in">
                    <span :key="currentOccupation" class="occupation">{{ currentOccupation }}</span>
                  </Transition>
                </span>
                <span class="grid-item">részére.</span>
              </span>
              <span v-else class="subtitle-mobile">
                <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="subtitle-link">Hasomer játékgyűjtemény</a>
                <span class="occupation-cell">
                  <Transition name="flip" mode="out-in">
                    <span :key="currentOccupation" class="occupation">{{ currentOccupation }}</span>
                  </Transition>
                </span>
              </span>
            </div>
          </Transition>
        </div>

        <v-spacer></v-spacer>

        <div class="d-flex align-center gap-3">
          <v-btn
            v-if="!isAuthenticated && !isMobile"
            href="https://somer.hu"
            target="_blank"
            color="rgba(255, 255, 255, 0.15)"
            variant="elevated"
            size="default"
            class="glass-btn"
          >
            <v-icon start>mdi-open-in-new</v-icon>
            <span v-if="!scrolled || lgAndUp">Somer.hu</span>
            <span v-else>Somer</span>
          </v-btn>

          <UserMenu @show-favorites="$emit('show-favorites')" />
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuth } from '@/composables/useAuth'
import logoSvg from '@/assets/somer-semel-white-with-transparent-bg.svg'
import UserMenu from '../auth/UserMenu.vue'

defineEmits<{
  'show-favorites': []
}>()

const { isAuthenticated } = useAuth()
const { xs, sm, md, lgAndUp } = useDisplay()
const logoUrl = logoSvg
const scrolled = ref(false)

// Responsive computed properties
const isMobile = computed(() => xs.value || sm.value)

const headerHeight = computed(() => {
  if (scrolled.value) {
    if (isMobile.value) return 56
    if (md.value) return 60
    return 70
  }
  if (isMobile.value) return 80
  if (md.value) return 100
  return 120
})

const logoSize = computed(() => {
  if (scrolled.value) {
    if (isMobile.value) return 30
    if (md.value) return 40
    return 60
  }
  if (isMobile.value) return 40
  if (md.value) return 60
  return 80
})

const titleClasses = computed(() => {
  const classes = ['main-title']
  
  if (scrolled.value) {
    if (isMobile.value) classes.push('text-subtitle-1')
    else if (md.value) classes.push('text-h6')
    else classes.push('text-h5')
  } else {
    if (isMobile.value) classes.push('text-h6')
    else if (md.value) classes.push('text-h5')
    else classes.push('text-h3')
  }
  
  return classes
})

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
  'pszichológusok',
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
  position: relative;
  z-index: 1;
  
  @media (max-width: 600px) {
    padding: 0 8px;
  }
}

.header-bar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-image: url('https://img.somer.hu/id/15W4slVSSb96GmxJeR7Nj0oq4b1-mm5SR/1200/300');
  background-size: cover;
  background-position: bottom;
  background-repeat: no-repeat;
  overflow: hidden;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(8, 160, 202, 0.7) 0%, rgba(8, 160, 202, 0.3) 100%);
  transition: background 0.4s ease;
  pointer-events: none;
}

.header-overlay-scrolled {
  background: linear-gradient(135deg, rgba(8, 160, 202, 0.85) 40%, rgba(8, 160, 202, 0.5) 100%);
  
  background-position: center;
}

.title-container {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-height: 80px;
  transition: all 0.4s ease;
  
  @media (max-width: 960px) {
    min-height: 60px;
  }
  
  @media (max-width: 600px) {
    min-height: 50px;
  }
}

.title-container-scrolled {
  min-height: 40px;
  
  @media (max-width: 960px) {
    min-height: 30px;
  }
  
  @media (max-width: 600px) {
    min-height: 24px;
  }
}

.main-title {
  color: white;
  font-family: 'Myriad Pro Black Italic', sans-serif !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.2;
  transition: all .5s ease;
}


.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Myriad Pro Regular', sans-serif !important;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  line-height: 1.3;
  max-width: 600px;
  height: 1.3rem;
}

.subtitle-mobile {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Myriad Pro Regular', sans-serif !important;
}

/* Subtitle transition animations */
.subtitle-enter-active,
.subtitle-leave-active {
  transition: all 0.5s ease;
}

.subtitle-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.subtitle-leave-to {
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
  transition: width 1s ease;
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

.glass-btn {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white !important;
  transition: all 0.3s ease;
  
  @media (max-width: 600px) {
    min-width: 48px !important;
    min-height: 48px !important;
    padding: 0 12px !important;
  }
}

.glass-btn:hover {
  background-color: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
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
