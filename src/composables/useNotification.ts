import { ref } from 'vue'

interface Notification {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

const show = ref(false)
const message = ref('')
const type = ref<'success' | 'error' | 'warning' | 'info'>('info')
const timeout = ref(3000)

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
      message: '🔒 Jelentkezz be a funkció használatához!',
      type: 'warning',
      timeout: 3000
    })
  }

  const hideNotification = () => {
    show.value = false
  }

  return {
    show,
    message,
    type,
    timeout,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showAuthRequired,
    hideNotification
  }
}
