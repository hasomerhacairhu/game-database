<template>
  <div>
    <!-- Bejelentkezés gomb, ha nincs user -->
    <v-btn
      v-if="!isAuthenticated"
      variant="elevated"
      color="white"
      prepend-icon="mdi-login"
      @click="openLoginDialog"
      size="default"
      class="header-btn"
    >
      Bejelentkezés
    </v-btn>

    <!-- User menü, ha be van jelentkezve -->
    <v-menu v-else>
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          variant="elevated"
          color="rgba(255, 255, 255, 0.15)"
          class="user-menu-btn header-btn"
          size="default"
        >
          <v-avatar size="32" class="mr-2">
            <v-img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userProfile.displayName"></v-img>
            <v-icon v-else icon="mdi-account-circle"></v-icon>
          </v-avatar>
          <span class="text-white font-weight-medium">{{ displayName }}</span>
          <v-icon icon="mdi-chevron-down" class="ml-1" color="white"></v-icon>
        </v-btn>
      </template>

      <v-list density="compact" min-width="200">
        <v-list-item>
          <v-list-item-title class="text-caption text-medium-emphasis">
            {{ userProfile?.email }}
          </v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-account"
          title="Profilom"
          @click="openProfileDialog"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-star"
          title="Kedvenc játékaim"
          @click="$emit('show-favorites')"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-open-in-new"
          title="Ugrás a somer.hu-ra"
          href="https://somer.hu"
          target="_blank"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-heart"
          title="Támogatom a Somert"
          href="https://somer.hu/tamogatom"
          target="_blank"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list-item
          prepend-icon="mdi-logout"
          title="Kijelentkezés"
          @click="handleSignOut"
        ></v-list-item>
      </v-list>
    </v-menu>

    <!-- Login Dialog -->
    <LoginDialog v-model="showLoginDialog" />

    <!-- Profile Dialog -->
    <UserProfileDialog 
      v-model="showProfileDialog"
      :is-required="false"
    />

    <!-- Mandatory Profile Dialog (ha nincs születési dátum) -->
    <UserProfileDialog 
      v-model="showMandatoryProfileDialog"
      :is-required="true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import LoginDialog from './LoginDialog.vue'
import UserProfileDialog from './UserProfileDialog.vue'

defineEmits<{
  'show-favorites': []
}>()

const { user, userProfile, isAuthenticated, isProfileComplete, signOut } = useAuth()

const showMandatoryProfileDialog = ref(false)

// Ha bejelentkezett de nincs kitöltve a profil, kötelező profil dialógus megnyitása
watch([isAuthenticated, isProfileComplete, userProfile], ([auth, complete]) => {
  if (auth && !complete) {
    showMandatoryProfileDialog.value = true
  } else {
    showMandatoryProfileDialog.value = false
  }
}, { immediate: true })

const showLoginDialog = ref(false)
const showProfileDialog = ref(false)

const displayName = computed(() => {
  if (userProfile.value?.displayName) {
    return userProfile.value.displayName
  }
  return user.value?.email?.split('@')[0] || 'User'
})

const openLoginDialog = () => {
  showLoginDialog.value = true
}

const openProfileDialog = () => {
  showProfileDialog.value = true
}

const handleSignOut = async () => {
  try {
    await signOut()
  } catch (err) {
    console.error('Kijelentkezési hiba:', err)
  }
}
</script>

<style scoped lang="scss">
.header-btn {
  transition: all 0.3s ease;
}

.user-menu-btn {
  text-transform: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  :deep(.v-btn__content) {
    gap: 0;
  }
}
</style>
