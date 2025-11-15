<template>
  <v-dialog v-model="dialogOpen" max-width="500">
    <v-card>
      <v-card-title class="bg-primary text-white d-flex align-center">
        <span>Bejelentkezés</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" @click="closeDialog" size="small" color="white"></v-btn>
      </v-card-title>

      <v-card-text class="pt-6">
        <div class="d-flex align-center mb-5">
          <v-icon icon="mdi-account-circle" size="64" color="primary" class="mr-4"></v-icon>
          <div>
            <h3 class="text-h6 mb-1">Üdvözlünk a Somer Játékadatbázisban!</h3>
            <p class="text-body-2 text-medium-emphasis mb-0">
              Jelentkezz be, hogy hozzáférj az alábbi funkciókhoz:
            </p>
          </div>
        </div>

        <v-row dense class="mb-3">
          <v-col cols="6">
            <div class="feature-item">
              <v-icon icon="mdi-text" size="32" color="primary" class="mb-1"></v-icon>
              <div class="text-caption">Teljes játékleírások olvasása</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="feature-item">
              <v-icon icon="mdi-heart" size="32" color="primary" class="mb-1"></v-icon>
              <div class="text-caption">Kedvenc játékok mentése</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="feature-item">
              <v-icon icon="mdi-alert-circle" size="32" color="primary" class="mb-1"></v-icon>
              <div class="text-caption">Pontatlanságok bejelentése</div>
            </div>
          </v-col>
          <v-col cols="6">
            <div class="feature-item">
              <v-icon icon="mdi-link-variant" size="32" color="primary" class="mb-1"></v-icon>
              <div class="text-caption">Játék forrás megnyitása</div>
            </div>
          </v-col>
        </v-row>

        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <div class="text-caption">
            <strong>Díjmentesen használható!</strong> Az alkalmazás 100%-ban ingyenes. A bejelentkezés a felhasználói élmény javítása mellett segít nekünk jobban megismerni közösségünket.
          </div>
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
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70px;
}
</style>
