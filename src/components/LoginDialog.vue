<template>
  <v-dialog v-model="dialogOpen" max-width="500">
    <v-card>
      <v-card-title class="bg-primary text-white d-flex align-center">
        <span>Bejelentkezés</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" size="small" color="white"></v-btn>
      </v-card-title>

      <v-card-text class="pt-6">
        <div class="text-center mb-6">
          <v-icon icon="mdi-account-circle" size="80" color="primary" class="mb-4"></v-icon>
          <h3 class="text-h6 mb-2">Üdvözlünk a Somer Játékadatbázisban!</h3>
          <p class="text-body-2 text-medium-emphasis">
            Jelentkezz be, hogy hozzáférj az alábbi funkciókhoz:
          </p>
        </div>

        <v-list density="compact" class="mb-4">
          <v-list-item prepend-icon="mdi-text" title="Teljes játékleírások olvasása"></v-list-item>
          <v-list-item prepend-icon="mdi-star" title="Kedvenc játékok mentése"></v-list-item>
          <v-list-item prepend-icon="mdi-alert-circle" title="Pontatlanságok bejelentése"></v-list-item>
          <v-list-item prepend-icon="mdi-table-arrow-right" title="Lapozás a táblázatban"></v-list-item>
          <v-list-item prepend-icon="mdi-download" title="Excel letöltés"></v-list-item>
          <v-list-item prepend-icon="mdi-link-variant" title="Játék forrás megnyitása"></v-list-item>
        </v-list>

        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <template v-slot:text>
            <strong>Díjmentesen használható!</strong><br>
            Az alkalmazás 100%-ban ingyenes. A bejelentkezés a felhasználói élmény javítása mellett segít nekünk jobban megismerni közösségünket.
          </template>
        </v-alert>

        <div v-if="error" class="mb-4">
          <v-alert type="error" variant="tonal" density="compact">
            {{ error }}
          </v-alert>
        </div>

        <v-btn
          block
          size="large"
          color="primary"
          prepend-icon="mdi-google"
          @click="handleGoogleSignIn"
          :loading="signingIn"
        >
          Bejelentkezés Google fiókkal
        </v-btn>

        <p class="text-caption text-center text-medium-emphasis mt-4">
          A bejelentkezéssel elfogadod az <a href="http://somer.hu/adatkezeles" target="_blank">adatkezelési szabályzatunkat</a>.
        </p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { signInWithGoogle, error: authError } = useAuth()

const signingIn = ref(false)
const error = ref<string | null>(null)

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const closeDialog = () => {
  dialogOpen.value = false
}

const handleGoogleSignIn = async () => {
  try {
    signingIn.value = true
    error.value = null
    await signInWithGoogle()
    closeDialog()
  } catch (err: any) {
    error.value = err.message || 'Hiba történt a bejelentkezés során'
  } finally {
    signingIn.value = false
  }
}
</script>

<style scoped lang="scss">
.v-list-item {
  min-height: 36px !important;
}
</style>
