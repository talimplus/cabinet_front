
// Vuetify
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VDateInput } from 'vuetify/labs/VDateInput'
// Components

const vuetify = createVuetify({
        components: {
                ...components,
                VDateInput
        },
        directives,
        theme: {
                defaultTheme: 'light',
                themes: {
                        light: {
                                colors: {
                                        primary: '#01c0c8',
                                        'on-primary': '#FFFFFF',
                                        secondary: '#424242',
                                        accent: '#82B1FF',
                                        error: '#FF5252',
                                        info: '#2196F3',
                                        success: '#4CAF50',
                                        warning: '#FFC107',
                                },
                        },
                },
        },
})

export default vuetify