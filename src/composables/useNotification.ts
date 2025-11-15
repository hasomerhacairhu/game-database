import { ref, computed } from 'vue'

interface Notification {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'warning' | 'info'>('info')
const timeout = ref(3000)

// Icon és színek a típus alapján
const iconMap = {
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information'
}

const iconColorMap = {
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3'
}

export function useNotification() {
  const showNotification = (notification: Notification) => {
    message.value = notification.message
    type.value = notification.type
    timeout.value = notification.timeout || 3000
    show.value = true
  }

  const showSuccess = (msg: string, customTimeout?: number) => {
    showNotification({
      message: msg,
      type: 'success',
      timeout: customTimeout || 3000
    })
  }

  const showError = (msg: string, customTimeout?: number) => {
    showNotification({
      message: msg,
      type: 'error',
      timeout: customTimeout || 5000
    })
  }

  const showInfo = (msg: string, customTimeout?: number) => {
    showNotification({
      message: msg,
      type: 'info',
      timeout: customTimeout || 3000
    })
  }

  const showWarning = (msg: string, customTimeout?: number) => {
    showNotification({
      message: msg,
      type: 'warning',
      timeout: customTimeout || 3000
    })
  }

  const showAuthRequired = () => {
    showNotification({
      message: 'Jelentkezz be a funkció használatához! 🔒',
      type: 'warning',
      timeout: 3000
    })
  }

  const hideNotification = () => {
    show.value = false
  }

  // Computed properties az ikon és szín meghatározásához
  const icon = computed(() => iconMap[type.value])
  const iconColor = computed(() => iconColorMap[type.value])

  return {
    show,
    message,
    type,
    timeout,
    icon,
    iconColor,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showAuthRequired,
    hideNotification
  }
}
