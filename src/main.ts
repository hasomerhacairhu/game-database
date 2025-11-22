import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import './styles/main.scss'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)

// Initialize auth listener immediately after Pinia setup
import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
authStore.initAuthListener()

app.mount('#app')
