import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { hu } from 'vuetify/locale'

export default createVuetify({
  components,
  directives,
  locale: {
    locale: 'hu',
    messages: { hu }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#2E7D32', // Somer zöld
          secondary: '#FFA726',
          accent: '#FF5722',
          error: '#F44336',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800'
        }
      }
    }
  }
})
