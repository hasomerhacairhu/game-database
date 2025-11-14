<template>
  <v-footer color="grey-darken-4" class="py-6 footer-dark">
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
              color="primary"
              variant="tonal"
              prepend-icon="mdi-alert-circle-outline"
              class="footer-btn"
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
              :href="isAuthenticated ? 'https://docs.google.com/spreadsheets/d/18wUOYj8UcEo7C-DAce2P_78kydHMvBi5LZaoBrx3iiQ/export?format=xlsx' : undefined"
              :target="isAuthenticated ? '_blank' : undefined"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-download"
              class="footer-btn"
              block
              @click.prevent="!isAuthenticated && $emit('auth-required')"
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
            color="primary"
            variant="elevated"
            prepend-icon="mdi-human-greeting"
            class="footer-btn"
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

const emit = defineEmits<{
  'auth-required': []
  'report-inaccuracy': []
}>()

const { isAuthenticated } = useAuth()

const handleReportClick = () => {
  if (!isAuthenticated.value) {
    emit('auth-required')
  } else {
    emit('report-inaccuracy')
  }
}
</script>

<style scoped>
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-dark {
  color: #E0E0E0 !important;
}

.footer-dark :deep(.text-medium-emphasis) {
  color: #BDBDBD !important;
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

/* Footer gombok - nincs aláhúzás */
.footer-btn {
  text-decoration: none !important;
}

.footer-btn :deep(a) {
  text-decoration: none !important;
}
</style>
