import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CurrentUser } from '@/types/user.types'

export const useUserStore = defineStore('user', () => {
  const user = ref<CurrentUser | null>(null)

  function setUser(userData: CurrentUser) {
    user.value = userData
  }

  function clearUser() {
    user.value = null
  }

  return { user, setUser, clearUser }
})
