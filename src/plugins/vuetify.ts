
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'
// Components

// Materio-inspired light theme. Brand identity (teal primary) is preserved;
// surfaces, text, borders, shadows and emphasis follow the Materio system.
const materioLight: ThemeDefinition = {
  dark: false,
  colors: {
    primary: '#01c0c8',
    'primary-darken-1': '#00aab1',
    'on-primary': '#FFFFFF',
    secondary: '#8A8D93',
    'secondary-darken-1': '#7C7F84',
    'on-secondary': '#FFFFFF',
    accent: '#82B1FF',
    error: '#FF4C51',
    'on-error': '#FFFFFF',
    info: '#16B1FF',
    'on-info': '#FFFFFF',
    success: '#56CA00',
    'on-success': '#FFFFFF',
    warning: '#FFB400',
    'on-warning': '#FFFFFF',
    background: '#F4F5FA',
    'on-background': '#2E263D',
    surface: '#FFFFFF',
    'on-surface': '#2E263D',
  },
  variables: {
    // Materio ink is #2E263D at graded opacities
    'border-color': '#2E263D',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.9,
    'medium-emphasis-opacity': 0.68,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.05,
    'focus-opacity': 0.1,
    'selected-opacity': 0.08,
    'activated-opacity': 0.1,
    'pressed-opacity': 0.12,
    'dragged-opacity': 0.1,
    // Soft, low-spread shadows in the brand-ink hue
    'shadow-key-umbra-color': '#2E263D',
  },
}

const vuetify = createVuetify({
  components: {
    ...components,
    VDateInput,
  },
  directives,
  theme: {
    defaultTheme: 'materioLight',
    themes: {
      materioLight,
    },
  },
  defaults: {
    VCard: {
      rounded: 'lg',
      flat: true,
    },
    VBtn: {
      rounded: 'md',
      flat: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VDateInput: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
      hideDetails: 'auto',
    },
    VChip: {
      rounded: 'md',
    },
    VDataTable: {
      hover: true,
    },
  },
})

export default vuetify
