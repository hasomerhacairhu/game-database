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

        <v-row class="mb-4">
          <v-col cols="6" class="text-center">
            <div class="feature-item">
              <v-icon icon="mdi-text" size="40" color="primary" class="mb-2"></v-icon>
              <div class="text-body-2">Teljes játékleírások olvasása</div>
            </div>
          </v-col>
          <v-col cols="6" class="text-center">
            <div class="feature-item">
              <v-icon icon="mdi-heart" size="40" color="primary" class="mb-2"></v-icon>
              <div class="text-body-2">Kedvenc játékok mentése</div>
            </div>
          </v-col>
          <v-col cols="6" class="text-center">
            <div class="feature-item">
              <v-icon icon="mdi-alert-circle" size="40" color="primary" class="mb-2"></v-icon>
              <div class="text-body-2">Pontatlanságok bejelentése</div>
            </div>
          </v-col>
          <v-col cols="6" class="text-center">
            <div class="feature-item">
              <v-icon icon="mdi-link-variant" size="40" color="primary" class="mb-2"></v-icon>
              <div class="text-body-2">Játék forrás megnyitása</div>
            </div>
          </v-col>
        </v-row>

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
.feature-item {
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}
</style>
