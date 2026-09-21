import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useUserStore } from '@/stores/user'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'

const STORAGE_KEY = 'activeCenterId'

/** Filialni almashtira oladigan rol turlari (admin — markaz egasi) */
const SWITCHER_ROLES = ['admin', 'super_admin']

/**
 * Header'da tanlanadigan **aktiv filial**.
 *
 * Bitta joyda tanlanadi va barcha sahifalarga tarqaladi:
 *  - o'qish so'rovlariga `baseHttp` avtomatik `centerId` qo'shadi
 *    (`apiPermissions.generated.ts` dagi `acceptsCenterId` ro'yxati bo'yicha);
 *  - yaratish formalari `centerIdForCreate` ni yuboradi.
 *
 * `activeCenterId === null` — "Barcha filiallar": so'rovga `centerId`
 * qo'shilmaydi va backend butun tashkilot bo'yicha qaytaradi.
 *
 * Admin bo'lmagan xodim filialni almashtira olmaydi — backend uni baribir
 * `req.user.centerId` ga qamab qo'yadi, shuning uchun front ham yubormaydi.
 */
export const useCenterStore = defineStore('center', () => {
  const centers = ref<Center[]>([])
  const activeCenterId = ref<number | null>(readStored())
  const loading = ref(false)
  const loaded = ref(false)

  const userStore = useUserStore()

  const canSwitch = computed(() =>
    SWITCHER_ROLES.includes(userStore.user?.role ?? ''),
  )

  const activeCenter = computed(
    () => centers.value.find((c) => c.id === activeCenterId.value) ?? null,
  )

  const defaultCenter = computed(
    () => centers.value.find((c) => c.isDefault) ?? centers.value[0] ?? null,
  )

  /**
   * So'rovlarga qo'shiladigan qiymat. `undefined` — filtr yubormaymiz
   * ("Barcha filiallar" yoki filialga qamalgan xodim).
   */
  const requestCenterId = computed<number | undefined>(() => {
    if (!canSwitch.value) return undefined
    return activeCenterId.value ?? undefined
  })

  /**
   * Yangi yozuv qaysi filialga tushadi.
   * "Barcha filiallar" tanlangan bo'lsa — standart (isDefault) filialga.
   * Admin bo'lmagan xodim uchun — o'zining filiali.
   */
  const centerIdForCreate = computed<number | null>(() => {
    if (!canSwitch.value) return userStore.user?.centerId ?? null
    return activeCenterId.value ?? defaultCenter.value?.id ?? null
  })

  async function load(force = false) {
    if (loaded.value && !force) return
    if (!userStore.user) return

    try {
      loading.value = true
      const { data } = await fetchAllCenters()
      centers.value = Array.isArray(data) ? data : []
      loaded.value = true

      // Saqlangan filial o'chirilgan bo'lsa — "Barcha filiallar"ga qaytamiz
      if (
        activeCenterId.value !== null &&
        !centers.value.some((c) => c.id === activeCenterId.value)
      ) {
        setActive(null)
      }
    } catch {
      centers.value = []
    } finally {
      loading.value = false
    }
  }

  function setActive(id: number | null) {
    activeCenterId.value = id
    try {
      if (id === null) localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, String(id))
    } catch {
      // Private rejimda localStorage yopiq bo'lishi mumkin — jim o'tamiz
    }
  }

  function reset() {
    centers.value = []
    loaded.value = false
    setActive(null)
  }

  return {
    centers,
    activeCenterId,
    activeCenter,
    defaultCenter,
    canSwitch,
    requestCenterId,
    centerIdForCreate,
    loading,
    loaded,
    load,
    setActive,
    reset,
  }
})

function readStored(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const id = Number(raw)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}
