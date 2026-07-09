import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'
import { defineRule } from 'vee-validate'
import { required, email } from '@vee-validate/rules'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import { useUserStore } from './stores/user'
import { getMe } from './services/pages/auth'

// Import global overrides AFTER Vuetify styles so they win on equal specificity
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

defineRule('required', required)
defineRule('email', email)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(i18n)
app.use(VueApexCharts)

// Initialize user from token if exists
const initUser = async () => {
  const token = localStorage.getItem('token')
  const currentRoute = router.currentRoute.value.path
  
  // Only fetch user if token exists and not on login/register pages
  if (token && currentRoute !== '/login' && currentRoute !== '/register') {
    try {
      const response = await getMe()
      const userStore = useUserStore()
      if (response?.user) {
        userStore.setUser(response.user)
      }
    } catch (error) {
      // If token is invalid, clear it
      localStorage.removeItem('token')
      if (currentRoute !== '/login') {
        router.push('/login')
      }
    }
  }
}

// Initialize user before mounting app
initUser().then(() => {
  app.mount('#app')
})
