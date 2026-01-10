import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useUserStore } from './stores/user'
import { getMe } from './services/pages/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)
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
