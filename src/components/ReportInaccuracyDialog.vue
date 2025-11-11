<template>
  <v-dialog v-model="dialogOpen" max-width="600" scrollable>
    <v-card>
      <v-card-title class="text-h5 bg-warning text-white d-flex align-center">
        <v-icon class="mr-2">mdi-alert-circle-outline</v-icon>
        <span>Pontatlanság bejelentése</span>
        <v-spacer></v-spacer>
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              icon="mdi-close"
              variant="text"
              color="white"
              @click="closeDialog"
              size="small"
            ></v-btn>
          </template>
          <span>Bezárás (ESC)</span>
        </v-tooltip>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pt-4">
        <v-form ref="formRef" v-model="formValid">
          <!-- Beküldő neve -->
          <v-text-field
            v-model="senderName"
            label="A neved *"
            placeholder="Írd be a neved"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-4"
          ></v-text-field>

          <!-- Játék neve (readonly) -->
          <v-text-field
            v-model="gameName"
            label="Játék neve *"
            variant="outlined"
            readonly
            class="mb-4"
          ></v-text-field>

          <!-- Pontatlanság leírása -->
          <v-textarea
            v-model="inaccuracyDescription"
            label="Pontatlanság leírása *"
            placeholder="Kérjük, írd le részletesen, mi a pontatlanság a játékszabályban..."
            variant="outlined"
            :rules="[rules.required, rules.minLength]"
            rows="6"
            counter
          ></v-textarea>

          <v-alert type="info" variant="tonal" class="mt-2">
            <div class="text-body-2">
              Bejelentésedet a <strong>{{ reportEmail }}</strong> címre küldjük el.
              Köszönjük a visszajelzésed!
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="text" @click="closeDialog">
          Mégse
        </v-btn>
        <v-btn 
          color="warning" 
          variant="flat"
          :disabled="!formValid"
          @click="submitReport"
        >
          Bejelentés küldése
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  gameName: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref()
const formValid = ref(false)
const senderName = ref('')
const gameName = ref(props.gameName)
const inaccuracyDescription = ref('')
const reportEmail = 'titkar@somer.hu'

const rules = {
  required: (value: string) => !!value || 'Ez a mező kötelező',
  minLength: (value: string) => (value && value.length >= 10) || 'Kérjük, legalább 10 karaktert írj'
}

// Játék név frissítése amikor prop változik
watch(() => props.gameName, (newName) => {
  gameName.value = newName
})

const closeDialog = () => {
  dialogOpen.value = false
  // Form reset
  setTimeout(() => {
    senderName.value = ''
    inaccuracyDescription.value = ''
    formRef.value?.reset()
  }, 300)
}

const submitReport = () => {
  if (!formValid.value) return

  // Email link generálása
  const subject = encodeURIComponent(`Pontatlanság bejelentése - ${gameName.value}`)
  const body = encodeURIComponent(
    `Beküldő neve: ${senderName.value}\n\n` +
    `Játék neve: ${gameName.value}\n\n` +
    `Pontatlanság leírása:\n${inaccuracyDescription.value}`
  )
  
  const mailtoLink = `mailto:${reportEmail}?subject=${subject}&body=${body}`
  window.location.href = mailtoLink

  closeDialog()
}
</script>
