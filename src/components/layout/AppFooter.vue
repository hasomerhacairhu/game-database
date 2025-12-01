<template>
  <v-footer class="py-6 footer-dark footer-with-bg">
    <v-container class="footer-content">
      <v-row align="start">
        <!-- Bal oszlop: Információk -->
        <v-col cols="12" md="4" class="text-left">
          <div class="text-body-1 mb-3">
            <strong>Somer Játékadatbázis</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Az adatbázist a Magyarországi Somer Hacair Egyesület üzemelteti. További információ rólunk: <a href="https://somer.hu/technikai" target="_blank">https://somer.hu/technikai</a>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Ha érdekel a munkánk, ne habozz, vedd fel velünk a kapcsolatot!
            <a href="https://somer.hu/kapcsolat" target="_blank">https://somer.hu/kapcsolat</a>
          </div>
        </v-col>

        <!-- Közép oszlop: Funkciók -->
        <v-col cols="12" md="4" class="text-left">
          <div class="text-body-1 mb-3">
            <strong>Hasznos funkciók</strong>
          </div>
          
          <div class="mb-4">
            <div class="text-body-2 text-medium-emphasis mb-2">
              Ha hibát találsz, kérlek segítsd a munkánkat és jelezd!
            </div>
            <v-btn
              color="rgba(8, 160, 202, 0.3)"
              variant="elevated"
              prepend-icon="mdi-alert-circle-outline"
              class="footer-btn glass-btn"
              block
              @click="handleReportClick"
            >
              Pontatlanság bejelentése
            </v-btn>
          </div>

          <div>
            <div class="text-body-2 text-medium-emphasis mb-2">
              Ha szeretnél te is dolgozni az adattal, töltsd le az adatbázist Excel formátumban:
            </div>
            <v-btn
                color="rgba(8, 160, 202, 0.3)"
                variant="elevated"
                prepend-icon="mdi-download"
                class="footer-btn glass-btn"
                block
                @click="handleDownloadClick"
            >
              Adatbázis letöltése (Excel)
            </v-btn>
          </div>
        </v-col>

        <!-- Jobb oszlop: Támogatás -->
        <v-col cols="12" md="4" class="text-left">
          <div class="text-body-1 mb-3">
            <strong>Tetszik az alkalmazás?</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            Támogasd a munkánkat, hogy még több hasznos eszközt tudjunk fejleszteni!
          </div>
          <v-btn
            href="https://somer.hu/tamogatom"
            target="_blank"
            color="rgba(8, 160, 202, 0.3)"
            variant="elevated"
            prepend-icon="mdi-human-greeting"
            class="footer-btn glass-btn"
            block
          >
            Támogatom a Somert
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">

import { useAuth } from '@/composables/useAuth'
import { useGameData } from '@/composables/useGameData'
import { exportArrayAsCSV } from '@/utils/csvExport'


const emit = defineEmits<{
  'auth-required': []
  'report-inaccuracy': []
}>()

const { isAuthenticated } = useAuth()
const { games } = useGameData()

const handleReportClick = () => {
  if (!isAuthenticated.value) {
    emit('auth-required')
  } else {
    emit('report-inaccuracy')
  }
}


  function handleDownloadClick() {
    if (!isAuthenticated.value) {
      emit('auth-required')
      return
    }
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const filename = `jatekadatbazis.hu-${yyyy}-${mm}-${dd}.csv`
  exportArrayAsCSV(Array.from(games.value), filename)
}
</script>

<style scoped>
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.footer-with-bg {
  background-image: 
    linear-gradient(rgba(33, 33, 33, 0.5) 0%, rgba(33, 33, 33, .8) 50%) ,
    /* url('https://img.somer.hu/id/1I7Uwu0oF9ku9kz13WuvVbbQ9dwxmOv6w/1200/450'); */
    /* url('https://img.somer.hu/id/1iVGN04r_9VKX1U7VqxtUJDjSZv_SCa-D/w/1200'); */
    /* url('https://img.somer.hu/id/18Vr22m0zn4RCjYWdBL-d0ubW5jRi6SBW/w/1200'); */
    url('https://img.somer.hu/id/1apfEHUzKXgy5uIIuDVUCblZpv1MESa35/w/1200');
    /* url('https://img.somer.hu/id/1zK5b9_Uv9Y1PASjKx1xuv4HYMpJSFtPk/w/1200'); */
    background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.footer-dark {
  color: #E0E0E0 !important;
}

.footer-dark :deep(.text-medium-emphasis) {
  color: #E0E0E0 !important;
  /* color: #BDBDBD !important; */
  opacity: 1 !important;
}

.footer-dark :deep(strong) {
  color: #FAFAFA !important;
}

a {
  color: #90CAF9 !important;
  text-decoration: underline;
}

a:hover {
  color: #64B5F6 !important;
}

/* Footer gombok - glassmorphism style */
.footer-btn {
  text-decoration: none !important;
}

.footer-btn :deep(a) {
  text-decoration: none !important;
}

.glass-btn {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(8, 160, 202, 0.3);
  color: white !important;
  transition: all 0.3s ease;
}

.glass-btn:hover {
  background-color: rgba(8, 160, 202, 0.5) !important;
  border-color: rgba(8, 160, 202, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(8, 160, 202, 0.3);
}
</style>
