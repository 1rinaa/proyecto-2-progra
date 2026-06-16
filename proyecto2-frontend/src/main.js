import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App    from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

// ── Preset personalizado sobre Aura ──
const CinePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fff0f1',
      100: '#ffd6d9',
      200: '#ffadb3',
      300: '#f87980',
      400: '#f04550',
      500: '#dc3545',
      600: '#bb2d3b',
      700: '#992530',
      800: '#771c25',
      900: '#55131a',
      950: '#330b10',
    },
    colorScheme: {
      dark: {
        surface: {
          0:   '#0a0a0f',
          50:  '#0f0f18',
          100: '#141420',
          200: '#1a1a2e',
          300: '#2a2a40',
          400: '#3a3a55',
          500: '#555570',
          600: '#7a7a95',
          700: '#a0a0b5',
          800: '#c5c5d5',
          900: '#e0e0e0',
          950: '#f0f0f5',
        },
        primary: {
          color:         '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.600}',
          activeColor:   '{primary.700}',
        },
        highlight: {
          background:    '{primary.500}',
          focusBackground: '{primary.600}',
          color:         '#ffffff',
          focusColor:    '#ffffff',
        },
      },
      light: {
        // igual que dark para que siempre sea oscuro
        surface: {
          0:   '#0a0a0f',
          50:  '#0f0f18',
          100: '#141420',
          200: '#1a1a2e',
          300: '#2a2a40',
          400: '#3a3a55',
          500: '#555570',
          600: '#7a7a95',
          700: '#a0a0b5',
          800: '#c5c5d5',
          900: '#e0e0e0',
          950: '#f0f0f5',
        },
        primary: {
          color:         '{primary.500}',
          contrastColor: '#ffffff',
          hoverColor:    '{primary.600}',
          activeColor:   '{primary.700}',
        },
        highlight: {
          background:    '{primary.500}',
          focusBackground: '{primary.600}',
          color:         '#ffffff',
          focusColor:    '#ffffff',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  theme: {
    preset: CinePreset,
    options: {
      darkModeSelector: 'none', // siempre oscuro
      cssLayer: false,
    }
  }
})

app.directive('click-outside', {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target)) binding.value()
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
})

app.mount('#app')