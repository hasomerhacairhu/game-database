<template>
  <v-app-bar
    color="primary"
    elevation="2"
    height="64"
    class="small-header-bar"
  >
    <div class="header-overlay"></div>
    <v-container class="small-header-content">
      <div class="d-flex align-center" style="width:100%">
        <a href="https://somer.hu" target="_blank" rel="noopener" class="logo-link mr-3" aria-label="Somer.hu">
          <v-img :src="logoUrl" alt="Somer Logo" width="48" height="48"></v-img>
        </a>

        <div class="small-title text-h6">JÁTÉKADATBÁZIS</div>

        <v-spacer />

        <div class="d-flex align-center gap-3">
          <v-btn
            v-if="!isAuthenticated"
            href="https://somer.hu"
            target="_blank"
            color="rgba(255, 255, 255, 0.15)"
            variant="elevated"
            size="small"
            class="glass-btn"
            aria-label="Open Somer.hu"
          >
            <v-icon start small>mdi-open-in-new</v-icon>
            <span>Somer</span>
          </v-btn>

          <UserMenu :show-name="showUserName" @show-favorites="$emit('show-favorites')" />
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAuth } from '@/composables/useAuth'
import logoSvg from '@/assets/somer-semel-white-with-transparent-bg.svg'
import UserMenu from '../auth/UserMenu.vue'

const { sm } = useDisplay()
const { user, isAuthenticated } = useAuth()
const logoUrl = logoSvg

const showUserName = computed(() => !!(sm.value && user.value && user.value.displayName))

defineEmits<{
  'show-favorites': []
}>()
</script>

<style scoped>
.small-header-bar {
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
  pointer-events: none;
}

.small-header-content {
  max-width: 1200px;
  padding: 0 12px;
  position: relative;
  z-index: 1;
}

.small-title {
  color: white;
  font-family: 'Myriad Pro Black Italic', sans-serif !important;
  font-weight: normal !important;
  font-style: normal !important;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.user-name {
  color: white;
  margin-left: 8px;
  font-weight: 600;
}
</style>
