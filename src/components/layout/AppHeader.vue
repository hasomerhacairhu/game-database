<template>
    <v-app-bar 
    color="primary" 
    elevation="2" 
    :height="dynamicHeaderHeight"
    scroll-behavior="elevate"
      :class="['header-bar', { 'is-scrolled': scrolled, 'second-slide-bg': !shouldAnimate }]"
  >
    <div class="header-overlay" :class="{ 'header-overlay-scrolled': scrolled }" :style="overlayStyle"></div>
    <v-container class="header-content">
      <div class="d-flex align-center" :style="{ height: dynamicHeaderHeight + 'px', transition: 'all 0.2s ease' }">
        <a href="https://somer.hu" target="_blank" rel="noopener noreferrer" class="logo-link mr-4">
          <v-img
            :src="logoUrl"
            alt="Somer Logo"
            :width="logoSize"
            :max-width="logoSize"
            :style="{ width: dynamicLogoWidth + 'px', transition: 'width 160ms cubic-bezier(0.4,0,0.2,1)' }"
          ></v-img>
        </a>

        <!-- Animated slides for md and up; for <md show only the second (small) slide statically -->
        <div v-if="shouldAnimate" class="title-container" :class="{ 'is-scrolled': scrolled }">
          <div class="header-slide header-slide-big">
            <div :class="titleClasses">JÁTÉKADATBÁZIS</div>
            <div class="subtitle">
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
          <div class="header-slide header-slide-small">
            <div :class="['main-title', 'text-h5']">JÁTÉKADATBÁZIS</div>
          </div>
        </div>
        <div v-else class="title-container-simple">
          <div class="header-slide header-slide-small">
            <div class="main-title text-h5">JÁTÉKADATBÁZIS</div>
          </div>
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
            <span v-if="!scrolled || shouldAnimate">Somer.hu</span>
            <span v-else>Somer</span>
          </v-btn>

          <UserMenu @show-favorites="$emit('show-favorites')" />
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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

// Animate header for md (>=960px) and up
const shouldAnimate = computed(() => md.value || lgAndUp.value)


// base header/logo sizes
const headerHeight = computed(() => {
  if (isMobile.value) return 80
  // keep largest header size for md and up so the big slide doesn't shrink when window narrows
  return 120
})

const logoSize = computed(() => {
  if (isMobile.value) return 40
  // keep largest logo size for md and up
  return 80
})

// scroll progress [0..1] where 0 = top, 1 = fully scrolled (used for smooth dynamic shrink)
const scrollProgress = ref(0)

// dynamic header height (px) and logo width (px) driven by scrollProgress
const minScale = 0.66
const dynamicHeaderHeight = computed(() => {
  const base = headerHeight.value
  // Only apply dynamic shrink when animations are enabled
  if (!shouldAnimate.value) return base
  return Math.round(base * (1 - scrollProgress.value * (1 - minScale)))
})

const dynamicLogoWidth = computed(() => {
  const base = logoSize.value
  if (!shouldAnimate.value) return base
  return Math.round(base * (1 - scrollProgress.value * (1 - minScale)))
})


const titleClasses = computed(() => {
  const classes = ['main-title']
  // Keep largest title on md and up; only use smaller size on mobile
  if (isMobile.value) classes.push('text-h6')
  else classes.push('text-h2')
  return classes
})

// Overlay style follows scroll progress so the gradient/opacity transitions with the header height
const overlayStyle = computed(() => {
  // If animations disabled, use the second-slide (scrolled) style statically
  if (!shouldAnimate.value) {
    return {
      background: 'linear-gradient(135deg, rgba(8, 160, 202, 0.85) 40%, rgba(8, 160, 202, 0.5) 100%)'
    }
  }

  const startAlpha = (0.7 + scrollProgress.value * 0.15).toFixed(3)
  const endAlpha = (0.3 + scrollProgress.value * 0.2).toFixed(3)
  return {
    background: `linear-gradient(135deg, rgba(8, 160, 202, ${startAlpha}) 0%, rgba(8, 160, 202, ${endAlpha}) 100%)`,
    transition: 'background 200ms ease'
  }
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

// legacy variable removed; keep for potential future use
// lastScrollY removed

const handleScroll = () => {
  if (!shouldAnimate.value) return
  const currentScrollY = window.scrollY
  // compute smooth scroll progress (0..1) over first 60px
  const progress = Math.max(0, Math.min(1, currentScrollY / 60))
  scrollProgress.value = progress

  // Set scrolled directly from current scroll position so the slide toggles reliably
  scrolled.value = currentScrollY > 50
}

onMounted(() => {
  // add listener only when animations are enabled initially
  if (shouldAnimate.value) window.addEventListener('scroll', handleScroll)

  // watch for breakpoint changes and add/remove listener
  const stop = watch(shouldAnimate, (val: boolean) => {
    if (val) window.addEventListener('scroll', handleScroll)
    else {
      window.removeEventListener('scroll', handleScroll)
      scrolled.value = false
      scrollProgress.value = 0
    }
  })

  // initialize scroll state so the correct slide is visible on load
  if (shouldAnimate.value) {
    handleScroll()
  }

  // 5 másodpercenként váltson foglalkozást
  occupationInterval = window.setInterval(() => {
    currentOccupation.value = getRandomOccupation()
  }, 5000)

  onUnmounted(() => {
    stop()
    if (shouldAnimate.value) window.removeEventListener('scroll', handleScroll)
    if (occupationInterval) clearInterval(occupationInterval)
  })
})
</script>

<style scoped>

/* Slide-up header animation */
.title-container {
  position: relative;
  /* keep header clipped to avoid scrollbars; allow subtitle to wrap instead */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 2 1 auto;
  height: 100%;
  will-change: transform;
}

.header-slide {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* Faster slide-up using element height (100%) and partial fade 50%->100% */
.title-container .header-slide {
  transition: transform 160ms cubic-bezier(0.4,0,0.2,1), opacity 140ms linear;
  backface-visibility: hidden;
}
.title-container .header-slide-big {
  transform: translateY(0);
  opacity: 1;
  z-index: 2;
}
.title-container .header-slide-small {
  transform: translateY(100%);
  opacity: 0.6;
  z-index: 1;
}
.title-container.is-scrolled .header-slide-big {
  /* move a bit further to avoid subpixel/rounding showing a thin strip */
  transform: translateY(calc(-100% - 2px));
  opacity: 0;
  pointer-events: none;
}
.title-container.is-scrolled .header-slide-small {
  transform: translateY(0);
  opacity: 1;
}


.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 12px;
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
  transition: height 200ms cubic-bezier(0.4,0,0.2,1), padding 200ms ease;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(8, 160, 202, 0.7) 0%, rgba(8, 160, 202, 0.3) 100%);
  transition: background 200ms ease, opacity 200ms ease;
  pointer-events: none;
}

.header-overlay-scrolled {
  background: linear-gradient(135deg, rgba(8, 160, 202, 0.85) 40%, rgba(8, 160, 202, 0.5) 100%);
  
  background-position: center;
}




.header-parallax-enter-active {
  transition: transform 0.6s cubic-bezier(0.77,0,0.175,1), opacity 0.5s ease;
}
.header-parallax-leave-active {
  transition: transform 0.6s cubic-bezier(0.77,0,0.175,1), opacity 0.5s ease;
}
.header-parallax-enter-from {
  transform: translateY(60px);
  opacity: 0;
}
.header-parallax-leave-to {
  transform: translateY(-60px);
  opacity: 0;
}
.header-parallax-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.header-parallax-enter-to {
  transform: translateY(0);
  opacity: 1;
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
  max-width: none;
  height: auto;
  min-height: 1.3rem;
  overflow: visible;
}


.subtitle-mobile {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5em;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Myriad Pro Regular', sans-serif !important;
  margin-top: 2px;
  margin-bottom: 2px;
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
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25em;
  align-items: baseline;
  white-space: normal;
}

.grid-item {
  white-space: nowrap;
}

.occupation-cell {
  display: inline-grid;
  transition: width 0.3s ease;
  min-width: 0;
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
