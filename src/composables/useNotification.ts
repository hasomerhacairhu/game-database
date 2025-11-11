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
    showAuthRequired,
    hideNotification
  }
}
