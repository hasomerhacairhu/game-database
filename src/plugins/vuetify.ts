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
  defaults: {
    VBtn: {
      style: 'font-family: "Myriad Pro", sans-serif; font-weight: 400;',
    },
    VTextField: {
      style: 'font-family: "Myriad Pro", sans-serif; font-weight: 400;',
    },
    VSelect: {
      style: 'font-family: "Myriad Pro", sans-serif; font-weight: 400;',
    },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#08A0CA', // Sötét kék
          secondary: '#82CDE9', // Világos kék
          accent: '#08A0CA',
          error: '#F44336',
          info: '#82CDE9',
          success: '#4CAF50',
          warning: '#FF9800',
          background: '#F5F9FA',
          surface: '#FFFFFF',
          
          // Somer arculati színek - sötét
          'somer-orange-dark': '#D84C15',
          'somer-yellow-dark': '#F2BC00',
          'somer-lime-dark': '#87B027',
          'somer-green-dark': '#369D37',
          'somer-cyan-dark': '#08A0CA',
          'somer-blue-dark': '#82CDE9',
          
          // Somer arculati színek - közepes (lighten-2)
          'somer-orange': '#E77A4D',
          'somer-yellow': '#F5CF40',
          'somer-lime': '#A3C45F',
          'somer-green': '#5FB561',
          'somer-cyan': '#40B4D9',
          'somer-blue': '#A4DBF0',
          
          // Somer arculati színek - világos (lighten-3)
          'somer-orange-light': '#F0A885',
          'somer-yellow-light': '#F8E080',
          'somer-lime-light': '#BFD897',
          'somer-green-light': '#88CD8B',
          'somer-cyan-light': '#78C8E8',
          'somer-blue-light': '#C6E9F7'
        }
      }
    }
  }
})
