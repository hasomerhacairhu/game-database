<template>
  <v-footer color="secondary" class="py-6">
    <v-container class="footer-content">
      <v-row>
        <!-- Bal oldal: Üzemeltető és kapcsolat -->
        <v-col cols="12" md="6" class="text-left">
          <div class="text-body-1 mb-3">
            <strong>Az adatbázist a Magyarországi Somer Hacair Egyesület üzemelteti.</strong>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            Ha hibát, pontatlanságot találsz az adatbázisban, kérjük jelezd felénk az 
            <a href="mailto:info@somer.hu">info@somer.hu</a> e-mail címen.
          </div>
        </v-col>

        <!-- Jobb oldal: Támogatás -->
        <v-col cols="12" md="6" class="text-left d-flex flex-column justify-center">
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
            >
              Támogatom a Somert
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
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
</style>
