<template>
  <v-dialog v-if="dialogOpen" v-model="dialogOpen" max-width="500" :persistent="isRequired">
    <v-card>
      <v-card-title class="bg-primary text-white d-flex align-center">
        <span>{{ isRequired ? 'Profil kitöltése (kötelező)' : 'Profilom' }}</span>
        <v-spacer></v-spacer>
        <v-btn 
          v-if="!isRequired"
          icon="mdi-close" 
          variant="text" 
          @click="closeDialog" 
          size="small" 
          color="white"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pt-6">
        <div class="text-center mb-6">
          <v-avatar size="80" class="mb-2">
            <v-img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="formData.displayName"></v-img>
            <v-icon v-else icon="mdi-account-circle" size="80" color="primary"></v-icon>
          </v-avatar>
          <p class="text-caption text-medium-emphasis">{{ userProfile?.email }}</p>
        </div>

        <v-alert v-if="isRequired" type="warning" variant="tonal" density="compact" class="mb-4">
          <strong>Profilod kitöltése szükséges!</strong><br>
          Kérjük add meg a születési dátumodat az alkalmazás használatához.
        </v-alert>

        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="formData.displayName"
            label="Neved"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="formData.phoneNumber"
            label="Telefonszámod (opcionális)"
            prepend-inner-icon="mdi-phone"
            variant="outlined"
            density="comfortable"
            placeholder="+36 20 123 4567"
            class="mb-2"
          ></v-text-field>

          <v-text-field
            v-model="formData.birthDate"
            label="Születési dátumod"
            prepend-inner-icon="mdi-cake-variant"
            variant="outlined"
            density="comfortable"
            type="date"
            :rules="[rules.required]"
            hint="Formátum: ÉÉÉÉ-HH-NN"
            persistent-hint
            class="mb-2"
          ></v-text-field>

          <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
            {{ error }}
          </v-alert>

          <v-alert v-if="successMessage" type="success" variant="tonal" density="compact" class="mb-4">
            {{ successMessage }}
          </v-alert>

          <div class="d-flex gap-2">
            <v-btn
              v-if="!isRequired"
              variant="outlined"
              @click="closeDialog"
              :disabled="saving"
            >
              Mégse
            </v-btn>
            <v-btn
              v-if="isRequired"
              variant="outlined"
              color="error"
              @click="handleSignOut"
              :disabled="saving"
            >
              Kijelentkezés
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              type="submit"
              :loading="saving"
            >
              {{ isRequired ? 'Folytatás' : 'Mentés' }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

const props = defineProps<{
  modelValue: boolean
  isRequired?: boolean // Ha true, kötelező kitölteni és nem lehet bezárni
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { user, userProfile, updateUserProfile, signOut } = useAuth()

const form = ref()
const saving = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const formData = ref({
  displayName: '',
  phoneNumber: '',
  birthDate: ''
})

const rules = {
  required: (value: string) => !!value || 'Ez a mező kötelező'
}

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => {
    // Ha kötelező, nem engedjük bezárni
    if (props.isRequired) return
    emit('update:modelValue', value)
  }
})

// Profil adatok betöltése amikor a dialog megnyílik VAGY amikor a userProfile változik
watch([() => props.modelValue, userProfile], ([isOpen, profile]) => {
  if (isOpen && profile) {
    // Ha a displayName üres a Firestore-ban, használjuk a Firebase Auth-ból érkező nevet
    const displayNameToUse = (profile.displayName && profile.displayName.trim() !== '') 
      ? profile.displayName 
      : (user.value?.displayName || profile.email?.split('@')[0] || '')
    
    formData.value = {
      displayName: displayNameToUse,
      phoneNumber: profile.phoneNumber || '',
      birthDate: profile.birthDate || ''
    }
    error.value = null
    successMessage.value = null
  }
}, { immediate: true })

const closeDialog = () => {
  // Ha kötelező, nem engedjük bezárni
  if (props.isRequired) return
  dialogOpen.value = false
}

const handleSignOut = async () => {
  try {
    saving.value = true
    await signOut()
    dialogOpen.value = false
  } catch (err: any) {
    error.value = err.message || 'Hiba történt a kijelentkezés során'
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  try {
    saving.value = true
    error.value = null
    successMessage.value = null

    await updateUserProfile({
      displayName: formData.value.displayName,
      phoneNumber: formData.value.phoneNumber || '',
      birthDate: formData.value.birthDate
    })

    successMessage.value = 'Profilod sikeresen frissítve!'
    
    // Bezárás rövidebb idő után
    if (props.isRequired) {
      // Kötelező profil esetén gyorsan bezárjuk
      setTimeout(() => {
        dialogOpen.value = false
      }, 300)
    } else {
      setTimeout(() => {
        closeDialog()
      }, 800)
    }
  } catch (err: any) {
    error.value = err.message || 'Hiba történt a mentés során'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped lang="scss">
.gap-2 {
  gap: 8px;
}
</style>
