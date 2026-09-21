import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CurrentUser } from '@/types/user.types'

/** Admin rolidagi "barcha ruxsatlar" kaliti (backend bilan bir xil). */
export const ALL_PERMISSIONS = '*'

export const useUserStore = defineStore('user', () => {
  const user = ref<CurrentUser | null>(null)

  /** Tez qidirish uchun Set — har bir `can()` chaqiruvida massiv aylanmaydi. */
  const permissions = computed(() => new Set(user.value?.permissions ?? []))

  /** Admin: bitta `*` kaliti barcha tekshiruvlarni qanoatlantiradi. */
  const isSuperUser = computed(() => permissions.value.has(ALL_PERMISSIONS))

  /**
   * Ruxsat tekshiruvi. Bir nechta kalit berilsa — **bittasi yetarli** (OR),
   * backenddagi `@RequirePermissions(...)` bilan bir xil mantiq.
   */
  function can(...keys: string[]): boolean {
    if (!user.value) return false
    if (isSuperUser.value) return true
    return keys.some((key) => permissions.value.has(key))
  }

  /** Berilgan kalitlarning **hammasi** kerak bo'lganda. */
  function canAll(...keys: string[]): boolean {
    if (!user.value) return false
    if (isSuperUser.value) return true
    return keys.every((key) => permissions.value.has(key))
  }

  function setUser(userData: CurrentUser) {
    user.value = userData
  }

  function clearUser() {
    user.value = null
  }

  return { user, permissions, isSuperUser, can, canAll, setUser, clearUser }
})
