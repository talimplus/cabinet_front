import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { OrganizationBranding } from '@/types/organization.types'
import { fetchOrganizationBranding } from '@/services/pages/organization'

/** Brending kiritilmagan markaz standart TalimPlus ko'rinishida qoladi */
export const DEFAULT_BRAND_NAME = 'TalimPlus'
export const DEFAULT_LOGO = '/talimplus-logo.svg'
export const DEFAULT_FAVICON = '/favicon.svg'

/**
 * O'quv markazining brendi: nom, logotip, favicon.
 *
 * Domen bitta (SaaS), lekin kabinetdagi logo, tab sarlavhasi va favicon
 * har bir markazning o'zinikini ko'rsatadi. Ma'lumot bir marta — login'dan
 * keyin ilova yuklanayotganda — olinadi.
 */
export const useBrandingStore = defineStore('branding', () => {
  const branding = ref<OrganizationBranding | null>(null)
  const loaded = ref(false)

  const name = computed(() => branding.value?.name?.trim() || DEFAULT_BRAND_NAME)
  const logoUrl = computed(() => branding.value?.logoUrl || DEFAULT_LOGO)
  const faviconUrl = computed(() => branding.value?.faviconUrl || DEFAULT_FAVICON)

  /** Brauzer tab'iga qo'llash: sarlavha + favicon */
  function applyToDocument() {
    document.title = name.value

    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = faviconUrl.value
  }

  function set(data: OrganizationBranding) {
    branding.value = data
    loaded.value = true
    applyToDocument()
  }

  async function load() {
    try {
      set(await fetchOrganizationBranding())
    } catch {
      // Brending ikkinchi darajali: olinmasa standart ko'rinish qoladi va
      // kabinet baribir ishlayveradi.
      loaded.value = true
    }
  }

  function reset() {
    branding.value = null
    loaded.value = false
    applyToDocument()
  }

  return { branding, loaded, name, logoUrl, faviconUrl, set, load, reset }
})
