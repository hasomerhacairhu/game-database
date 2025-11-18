<template>
  <div>
    <!-- Bejelentkezés gomb, ha nincs user -->
    <v-btn
      v-if="!isAuthenticated"
      variant="elevated"
      color="rgba(255, 255, 255, 0.15)"
      @click="openLoginDialog"
      size="default"
      class="glass-btn"
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
          class="user-menu-btn glass-btn"
          size="large"
        >
          <v-avatar size="32" class="user-avatar">
            <v-img v-if="userProfile?.photoURL" :src="userProfile.photoURL" :alt="userProfile.displayName"></v-img>
            <v-icon v-else icon="mdi-account-circle"></v-icon>
          </v-avatar>
          <span class="text-white font-weight-medium user-name">{{ displayName }}</span>
          <v-icon icon="mdi-chevron-down" class="chevron-icon" color="white"></v-icon>
        </v-btn>
      </template>

      <v-list class="user-dropdown" density="comfortable" min-width="240" elevation="4">
        <v-list-item class="email-item">
          <v-list-item-title class="text-body-2 text-medium-emphasis">
            {{ userProfile?.email }}
          </v-list-item-title>
        </v-list-item>

        <v-divider class="my-1"></v-divider>

        <v-list-item
          prepend-icon="mdi-account"
          title="Profilom"
          class="menu-item"
          @click="openProfileDialog"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-heart"
          title="Kedvenc játékaim"
          class="menu-item"
          @click="$emit('show-favorites')"
        ></v-list-item>

        <v-divider class="my-1"></v-divider>

        <v-list-item
          prepend-icon="mdi-open-in-new"
          title="Ugrás a somer.hu-ra"
          class="menu-item"
          href="https://somer.hu"
          target="_blank"
        ></v-list-item>

        <v-list-item
          prepend-icon="mdi-human-greeting"
          title="Támogatom a Somert"
          class="menu-item"
          href="https://somer.hu/tamogatom"
          target="_blank"
        ></v-list-item>

        <v-divider class="my-1"></v-divider>

        <v-list-item
          prepend-icon="mdi-logout"
          title="Kijelentkezés"
          class="menu-item"
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

const { user, userProfile, isAuthenticated, isProfileComplete, loading, signOut } = useAuth()

const showMandatoryProfileDialog = ref(false)

// Ha bejelentkezett de nincs kitöltve a profil, kötelező profil dialógus megnyitása
// Csak akkor fut, ha már betöltődött a profil (loading === false)
watch(
  () => [isAuthenticated.value, isProfileComplete.value, userProfile.value, loading.value],
  ([auth, complete, profile, isLoading]) => {
    // Ne mutassuk azonnal, várjunk a betöltésre
    if (isLoading) {
      showMandatoryProfileDialog.value = false
      return
    }
    
    // Ha be van jelentkezve és a profil betöltődött, de nincs születési dátum
    if (auth && profile !== null && !complete) {
      showMandatoryProfileDialog.value = true
    } else {
      showMandatoryProfileDialog.value = false
    }
  }
)

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
.glass-btn {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white !important;
  transition: all 0.3s ease;
}

.glass-btn:hover {
  background-color: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.user-menu-btn {
  text-transform: none;
  border: none;
  padding: 8px 16px !important;
  height: auto !important;
  min-height: 48px !important;
  border-radius: 28px !important;
  backdrop-filter: blur(10px);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  :deep(.v-btn__content) {
    gap: 10px;
    display: flex;
    align-items: center;
  }
  
  .user-avatar {
    margin: 0;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  
  .user-name {
    margin: 0 4px;
    font-size: 0.95rem;
  }
  
  .chevron-icon {
    margin: 0;
    opacity: 0.7;
    font-size: 20px;
  }
}

.user-dropdown {
  padding: 8px 0;
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  
  .email-item {
    pointer-events: none;
    background-color: transparent !important;
  }
  
  .menu-item {
    &:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  }
}
</style>
