<template>
  <v-footer color="secondary" class="py-6">
    <v-container class="footer-content">
      <v-row align="start">
        <!-- A oszlop: Üzemeltető + Támogatás -->
        <v-col cols="12" md="6" class="text-left">
          <!-- Üzemeltető és kapcsolat -->
          <div class="text-body-1 mb-3">
            <strong>Az adatbázist a Magyarországi Somer Hacair Egyesület üzemelteti.</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-5">
            Ha hibát, pontatlanságot találsz az adatbázisban, kérjük jelezd felénk az 
            <a href="mailto:info@somer.hu">info@somer.hu</a> e-mail címen.
          </div>

          <!-- Támogatás -->
          <div class="text-body-1 mb-2">
            <strong>Tetszik az alkalmazás?</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis mb-3">
            Támogasd a munkánkat, hogy még több hasznos eszközt tudjunk fejleszteni!
          </div>
          <div>
            <v-btn
              href="https://somer.hu/tamogatom"
              target="_blank"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-heart"
              class="footer-btn"
            >
              Támogatom a Somert
            </v-btn>
          </div>
        </v-col>

        <!-- B oszlop: Képzők és fejlesztők -->
        <v-col cols="12" md="6" class="text-left">
          <div class="text-body-1 mb-2">
            <strong>Képzőknek és fejlesztőknek</strong>
          </div>
          <div class="mb-3">
            <v-btn
              :href="isAuthenticated ? 'https://docs.google.com/spreadsheets/d/1rYY5FKMq4wHGI-5i_wIHcdQxgGUgx_IyYlZKdnD2P-A/export?format=xlsx' : undefined"
              target="_blank"
              color="primary"
              variant="elevated"
              prepend-icon="mdi-download"
              class="footer-btn mb-2"
              @click.prevent="!isAuthenticated && $emit('auth-required')"
            >
              Teljes adatbázis letöltése (Excel)
            </v-btn>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Ha szeretnél hozzátenni a gyűjteményhez, <a href="https://somer.hu/kapcsolat" target="_blank">vedd fel velünk a kapcsolatot</a>!
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'

defineEmits<{
  'auth-required': []
}>()

const { isAuthenticated } = useAuth()
</script>

<style scoped>
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

a {
  color: inherit;
  text-decoration: underline;
}

a:hover {
  color: var(--v-primary-base);
}

/* Footer gombok - nincs aláhúzás */
.footer-btn {
  text-decoration: none !important;
}

.footer-btn :deep(a) {
  text-decoration: none !important;
}
</style>
