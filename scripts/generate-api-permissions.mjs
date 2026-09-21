/**
 * Backend controller'laridagi `@RequirePermissions(...)` dekoratorlarini o'qib,
 * frontend uchun "endpoint → kerakli ruxsatlar" jadvalini generatsiya qiladi.
 *
 * Natija: `src/permissions/apiPermissions.generated.ts`
 * Ishga tushirish: `npm run gen:api-permissions`
 *
 * Bu jadval ikki joyda ishlatiladi:
 *  1. `baseHttp.ts` — ruxsat yo'q bo'lsa so'rov umuman yuborilmaydi (403 olmaymiz).
 *  2. Audit: frontdagi har bir chaqiruv qaysi ruxsatni talab qilishini tekshirish.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const FRONT = join(HERE, '..')
const BACKEND_SRC = join(FRONT, '..', 'learning-center-saas', 'src')
const OUT = join(FRONT, 'src', 'permissions', 'apiPermissions.generated.ts')

const HTTP_DECORATOR = /^\s*@(Get|Post|Put|Patch|Delete)\(([^)]*)\)\s*$/
const CONTROLLER_DECORATOR = /^\s*@Controller\(([^)]*)\)\s*$/
const REQUIRE_PERMISSIONS = /@RequirePermissions\(([^)]*)\)/
const PUBLIC_DECORATOR = /^\s*@Public\(\)\s*$/
const STRING_LITERAL = /'([^']*)'|"([^"]*)"/g

/** Dekorator argumentidagi barcha string literallarni ajratib oladi */
const literals = (raw) => {
  const out = []
  let m
  STRING_LITERAL.lastIndex = 0
  while ((m = STRING_LITERAL.exec(raw)) !== null) out.push(m[1] ?? m[2])
  return out
}

const walk = (dir) => {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...walk(full))
    else if (entry.endsWith('.controller.ts')) found.push(full)
  }
  return found
}

/** '/a/b' ko'rinishiga keltiradi: bo'sh segmentlarni tashlaydi */
const joinPath = (...parts) => {
  const segments = parts
    .flatMap((p) => String(p ?? '').split('/'))
    .map((s) => s.trim())
    .filter(Boolean)
  return '/' + segments.join('/')
}

/**
 * Query DTO'si ichida `centerId` bo'lgan klasslar. Ba'zi endpointlar
 * `@Query('centerId')` emas, butun DTO oladi (masalan QueryStaffAttendanceDto).
 */
const dtoWithCenterId = new Set()
const walkAll = (dir) => {
  const found = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) found.push(...walkAll(full))
    else if (entry.endsWith('.ts')) found.push(full)
  }
  return found
}
for (const file of walkAll(BACKEND_SRC)) {
  if (!file.includes('/dto/')) continue
  const text = readFileSync(file, 'utf8')
  // Har bir klass tanasini alohida tekshiramiz
  const parts = text.split(/export class /).slice(1)
  for (const part of parts) {
    const name = part.split(/[\s{]/)[0]
    const body = part.slice(0, part.indexOf('\n}') + 1)
    if (/\bcenterId\b/.test(body)) dtoWithCenterId.add(name)
  }
}

const QUERY_CENTER_ID = /@Query\(\s*['"]centerId['"]\s*\)/
const QUERY_DTO = /@Query\(\s*\)\s*\w+\s*:\s*(\w+)/

const rules = []
const files = walk(BACKEND_SRC).sort()

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n')

  // Controller bazasi
  let base = ''
  for (const line of lines) {
    const m = CONTROLLER_DECORATOR.exec(line)
    if (m) {
      base = literals(m[1])[0] ?? ''
      break
    }
  }

  // Route dekoratorlari: har birining "bloki" keyingi route dekoratorigacha
  const routeIndexes = []
  lines.forEach((line, i) => {
    const m = HTTP_DECORATOR.exec(line)
    if (m) routeIndexes.push({ i, method: m[1].toUpperCase(), arg: m[2] })
  })

  routeIndexes.forEach((route, idx) => {
    const end = idx + 1 < routeIndexes.length ? routeIndexes[idx + 1].i : lines.length
    const block = lines.slice(route.i, end)
    const chunk = block.join('\n')

    // Ochiq endpointlar ham jadvalga kiradi: ular parametrli qoidani
    // "to'sib" turishi kerak (masalan '/centers/all' vs '/centers/:id').
    const isPublic = block.some((l) => PUBLIC_DECORATOR.test(l))
    const m = isPublic ? null : REQUIRE_PERMISSIONS.exec(chunk)
    const permissions = m ? literals(m[1]) : []

    // Endpoint `centerId` filtrini qabul qiladimi — header'dagi aktiv filialni
    // avtomatik qo'shish uchun kerak (`baseHttp.ts`).
    const queryDto = QUERY_DTO.exec(chunk)?.[1]
    const acceptsCenterId =
      QUERY_CENTER_ID.test(chunk) || (!!queryDto && dtoWithCenterId.has(queryDto))

    const sub = literals(route.arg)[0] ?? ''
    rules.push({
      method: route.method,
      path: joinPath(base, sub),
      permissions,
      acceptsCenterId,
      source: relative(join(FRONT, '..'), file),
    })
  })
}

// Bir xil method+path ikki marta uchrasa — ogohlantiramiz (jadval noaniq bo'lib qoladi)
const seen = new Map()
for (const r of rules) {
  const key = `${r.method} ${r.path}`
  const prev = seen.get(key)
  if (prev && prev.permissions.join() !== r.permissions.join()) {
    console.warn(
      `⚠ ${key} ikki xil ruxsat bilan e'lon qilingan: ` +
        `[${prev.permissions}] (${prev.source}) va [${r.permissions}] (${r.source})`,
    )
  }
  seen.set(key, r)
}

// Barqaror tartib (diff toza bo'lishi uchun)
rules.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method))

const body = rules
  .map(
    (r) =>
      `  { method: '${r.method}', path: '${r.path}', permissions: [${r.permissions
        .map((p) => `'${p}'`)
        .join(', ')}]${r.acceptsCenterId ? ', acceptsCenterId: true' : ''} },`,
  )
  .join('\n')

const out = `/**
 * AVTOMATIK GENERATSIYA QILINGAN — QO'LDA TAHRIRLAMANG.
 *
 * Manba: learning-center-saas/src ichidagi barcha controller fayllar
 * (\`@RequirePermissions(...)\` dekoratorlari).
 * Qayta generatsiya: npm run gen:api-permissions
 *
 * Jadvalda backenddagi BARCHA endpointlar bor. \`permissions: []\` — endpoint
 * ochiq. Ochiq endpointlar ham ro'yxatda turadi, chunki ular parametrli
 * qoidani to'sishi kerak ('/centers/all' ochiq, '/centers/:id' esa emas).
 * Ro'yxatda umuman yo'q manzil — tekshirilmaydi (default: ochiq).
 */

export interface ApiPermissionRule {
  method: string
  /** Nest shabloni, masalan '/subjects/:id' */
  path: string
  /** Bittasi yetarli (OR) — backenddagi PermissionsGuard bilan bir xil */
  permissions: string[]
  /**
   * Endpoint \`centerId\` filtrini qabul qiladi. \`baseHttp.ts\` bunday
   * so'rovlarga header'da tanlangan aktiv filialni avtomatik qo'shadi.
   */
  acceptsCenterId?: boolean
}

export const API_PERMISSION_RULES: ApiPermissionRule[] = [
${body}
]
`

writeFileSync(OUT, out)
console.log(`${rules.length} ta qoida yozildi → ${relative(FRONT, OUT)}`)
