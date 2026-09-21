/** O'quv markazi brendi — kabinet nomi, logotipi va favicon'i */

export interface OrganizationBranding {
  organizationId: number
  name: string
  /** `data:image/...;base64,...` yoki `https://...`. Bo'sh bo'lsa standart logo */
  logoUrl: string | null
  faviconUrl: string | null
  brandingUpdatedAt: string | null
}

export interface OrganizationBrandingForm {
  name?: string
  /** Bo'sh satr yuborilsa rasm olib tashlanadi */
  logoUrl?: string | null
  faviconUrl?: string | null
}
