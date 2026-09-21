import {
  API_PERMISSION_RULES,
  type ApiPermissionRule,
} from './apiPermissions.generated'

/**
 * So'rov manzilini backenddagi `@RequirePermissions(...)` bilan moslashtiradi.
 *
 * Maqsad — ruxsati yo'q endpointga umuman so'rov yubormaslik: 403 olib,
 * ekranda keraksiz xato chiqishining oldini olamiz. Asosiy himoya baribir
 * backendda qoladi, bu faqat UI qatlamidagi filtr.
 */

interface CompiledRule {
  method: string
  regex: RegExp
  permissions: string[]
  /** Statik segment ko'p bo'lgan qoida birinchi tekshiriladi ('/groups/all' > '/groups/:id') */
  specificity: number
}

const escape = (segment: string) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const compile = (rule: ApiPermissionRule): CompiledRule => {
  const segments = rule.path.split('/').filter(Boolean)
  const statics = segments.filter((s) => !s.startsWith(':')).length
  const pattern = segments
    .map((s) => (s.startsWith(':') ? '[^/]+' : escape(s)))
    .join('/')

  return {
    method: rule.method,
    regex: new RegExp(`^/${pattern}$`),
    permissions: rule.permissions,
    specificity: statics * 1000 + segments.length,
  }
}

const COMPILED: CompiledRule[] = API_PERMISSION_RULES.map(compile).sort(
  (a, b) => b.specificity - a.specificity,
)

/** `http://host/students/12?page=1` → `/students/12` */
const normalize = (url: string): string => {
  let path = url

  // Absolyut manzil bo'lsa — origin'ni olib tashlaymiz
  const schemeIndex = path.indexOf('://')
  if (schemeIndex !== -1) {
    const slash = path.indexOf('/', schemeIndex + 3)
    path = slash === -1 ? '/' : path.slice(slash)
  }

  path = path.split('?')[0].split('#')[0]
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)

  return path
}

/**
 * Shu so'rov uchun kerakli ruxsatlar (bittasi yetarli — OR).
 * `null` — endpoint ruxsat talab qilmaydi.
 */
export const permissionsForRequest = (
  method: string | undefined,
  url: string | undefined,
): string[] | null => {
  if (!url) return null

  const verb = (method ?? 'get').toUpperCase()
  const path = normalize(url)

  const rule = COMPILED.find((r) => r.method === verb && r.regex.test(path))
  // Qoida topilmadi yoki `permissions: []` (ochiq endpoint) — tekshirmaymiz
  return rule && rule.permissions.length ? rule.permissions : null
}

/** Ruxsat yo'qligi sababli yuborilmagan so'rov xatosi */
export class PermissionDeniedError extends Error {
  readonly isPermissionDenied = true

  constructor(
    readonly method: string,
    readonly url: string,
    readonly required: string[],
  ) {
    super(`Ruxsat yo'q: ${method.toUpperCase()} ${url} (${required.join(' | ')})`)
    this.name = 'PermissionDeniedError'
  }
}

export const isPermissionDeniedError = (error: unknown): boolean =>
  !!error && typeof error === 'object' && 'isPermissionDenied' in error
