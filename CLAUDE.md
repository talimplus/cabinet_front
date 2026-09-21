# Frontend — `cabinet_front`

Ta'lim markazi CRM kabineti. Vue 3 (`<script setup>`) + Vite + TypeScript + Vuetify 3 +
Pinia + Vue Router + vue-i18n + axios.

> Backend — `../learning-center-saas/` (o'z `CLAUDE.md` si bor). API kontrakti
> o'zgarsa ikkalasi **bir vaqtda** to'g'rilanadi.
>
> ⛔️ `../cabinet_front_new/` — bu loyihaning yangi versiyasi, unga **yozilmaydi**.

---

## 1. Buyruqlar

```bash
npm run dev                  # vite dev server
npm run type-check           # vue-tsc --noEmit  ← o'zgarishdan keyingi asosiy tekshiruv
npm run build                # type-check + vite build
npm run lint                 # eslint --fix
npm run gen:api-permissions  # backend controllerlaridan ruxsat jadvalini yangilaydi
```

- API manzili: `.env` dagi `VITE_API_URL` (hozir `http://localhost:3004`).
- Alias: `@/` → `src/`.

## 2. Tuzilma

```
src/
  main.ts, App.vue
  router/index.ts        — barcha route'lar, meta.permission, auth guard
  layouts/default.vue    — sidebar menyu (permission bo'yicha filtrlanadi) + topbar
  views/                 — sahifalar (router shu yerga qaraydi)
  components/pages/<domen>/  — sahifaga tegishli modal/kartochkalar
  services/baseHttp.ts   — axios instance (token, ruxsat filtri, xatolar)
  services/pages/*.ts    — har bir domen uchun API funksiyalari
  stores/                — pinia: user, notification
  composables/           — usePermissions, useDebounceFn
  permissions/           — apiPermissions.ts + apiPermissions.generated.ts
  types/                 — API modellari (backend DTO'lariga mos)
  locales/uz|ru/*.ts     — i18n (fayl nomi = namespace)
  plugins/               — vuetify, i18n
```

**Qoida:** yangi API chaqiruvi to'g'ridan-to'g'ri komponentdan emas,
`services/pages/<domen>.ts` orqali qilinadi; javob tipi `types/` da yoziladi.

## 3. HTTP qatlami (`services/baseHttp.ts`)

- Request interceptor: `localStorage.token` → `Authorization: Bearer ...`.
- **Ruxsat filtri:** `permissionsForRequest(method, url)` jadvaldan endpointga kerakli
  ruxsatni topadi; foydalanuvchida bo'lmasa so'rov **umuman yuborilmaydi**
  (`PermissionDeniedError`) va xato ko'rsatilmaydi. Foydalanuvchi hali yuklanmagan
  bo'lsa tekshiruv o'tkazib yuboriladi (qaror backendga qoladi).
- Response: 401 → login sahifasi; blob (Excel) xatolari JSON ga ochiladi
  (`normalizeBlobError`), aks holda xabar yo'qoladi.
- Xato formati: 422 → `{ errors: { field: msg } }` (formaga `setErrors` bilan beriladi),
  400 → `{ message }` (snackbar).

## 3.1 Aktiv filial (header'dagi tanlagich)

Filial **bitta joyda** tanlanadi — header'dagi select (`layouts/default.vue`).
Sahifalarda va formalarda alohida "filial" tanlagichi **yo'q**.

- Store: `stores/center.ts` (`activeCenterId`, localStorage'da saqlanadi).
  `null` — "Barcha filiallar": `centerId` umuman yuborilmaydi va backend butun
  tashkilot bo'yicha qaytaradi.
- **O'qishda:** `baseHttp` `centerId` ni avtomatik qo'shadi — faqat uni qabul
  qiladigan endpointlarga (`apiPermissions.generated.ts` dagi `acceptsCenterId`,
  backend controllerlaridan generatsiya qilinadi). Blanket qo'shib bo'lmaydi:
  backenddagi `forbidNonWhitelisted` begona query/body maydoniga 422 beradi.
- **Yaratishda:** forma `centerStore.centerIdForCreate` ni yuboradi — aktiv
  filial, "barchasi" bo'lsa standart (`isDefault`) filial, admin bo'lmasa
  xodimning o'z filiali.
- Filial almashganda `<router-view :key="...">` sahifani qaytadan mount qiladi,
  shuning uchun har bir sahifaga alohida watcher yozish shart emas.
- Admin bo'lmagan xodim tanlagichni ko'rmaydi (`canSwitch`) va unga `centerId`
  yuborilmaydi — backend uni baribir `req.user.centerId` ga qamab qo'yadi.
- Sahifa o'zi aniq `centerId` bersa — interceptor unga tegmaydi.

## 4. Ruxsatlar (dinamik rollar)

Rol nomiga qarab **hech qachon** tekshirilmaydi — faqat ruxsat kalitiga.

| Qatlam | Qanday |
|---|---|
| Sahifa | `router` dagi `meta.permission: ['groups.view']` |
| Menyu | `layouts/default.vue` dagi `item.permission` |
| Tugma/blok | `userStore.can('students.create')` yoki `usePermissions().can(...)` |
| So'rov | `apiPermissions.generated.ts` jadvali (avtomatik) |

- `userStore.can(...keys)` — **OR** (bittasi yetarli), `canAll(...)` — hammasi kerak.
  Admin `'*'` kalitiga ega → hamma tekshiruvdan o'tadi.
- Menyuda `hideForBaseRoles` ham bor (`layouts/default.vue`) — bu **ruxsat emas,
  biznes-mantiq**: admin `'*'` bilan hamma narsani ko'radi, lekin ba'zi sahifa
  unga ma'nosiz (masalan "Mening faoliyatim" — markaz egasiga davomat/jarima
  yozilmaydi). Ruxsat tekshiruvi o'rniga emas, ustiga qo'shiladi.
- `usePermissions()` da tayyor flaglar: `canViewCenters`, `canViewSubjects`,
  `canViewRooms`, `canViewGroups`, `canViewStudents`, `canViewReceipts`, ... .
  **Ma'lumot keladigan blok/select/tab `v-if` bilan yashirilishi shart** — aks holda
  so'rov to'xtaydi-yu, foydalanuvchi bo'sh select ko'radi.
- Ruxsatlar `/users/me` (login/bootstrap) javobidan keladi, tokenda saqlanmaydi →
  admin rolni o'zgartirsa qayta login shart emas.

Jadvalda `acceptsCenterId: true` ham bor — endpoint `centerId` filtrini
qabul qilishini bildiradi (aktiv filial shunga qarab qo'shiladi).

**`apiPermissions.generated.ts` qo'lda tahrirlanmaydi.** Backendda
`@RequirePermissions(...)` qo'shilsa/o'zgarsa → `npm run gen:api-permissions`.
Jadvalda barcha endpointlar bor; `permissions: []` — ochiq endpoint
(masalan `/centers/all`, `/users/me`), ular parametrli qoidani to'sish uchun turadi.

## 5. i18n

- `locales/uz/*.ts` va `locales/ru/*.ts` — fayl nomi namespace bo'ladi
  (`groups.ts` → `$t('groups.form.monthlyFee')`).
- **Har bir yangi matn ikkala tilga ham qo'shiladi.** Til `localStorage.locale` da,
  default `uz`.
- Parametr: `$t('groups.table.upcomingFee', { fee, date })`.
- Komponent ichida `const { t } = useI18n()`, shablonda `$t(...)`.

## 6. UI konvensiyalari

- Vuetify 3: `v-data-table`, `v-dialog`, `v-select`, `v-text-field variant="outlined"`,
  `v-alert variant="tonal" density="compact"` (ogohlantirishlar uchun).
- Formalar — `vee-validate` (`Field` + `v-slot="{ handleChange, handleBlur, errors }"`)
  + `yup` sxemalar; serverdan kelgan 422 `formRef.setErrors(response.errors)` bilan qo'yiladi.
- Bildirishnoma — `useNotificationStore()`: `notify.success/error/warning/info`
  (komponentdan tashqarida ham chaqirilishi mumkin).
- Sana/pul formatlash uchun umumiy util **yo'q** — har sahifa o'zida `formatCurrency` /
  `formatDate` yozadi (`Intl.NumberFormat('uz-UZ')`, ` so'm`). Yangi joyda ham shu uslub.
- Xato xabarini olish uchun `services/apiError.ts`: `apiErrorMessage(error)` (snackbar)
  va `apiFieldErrors(error)` (422 → `setErrors`). `(err as any).response...` yozilmaydi.
- `dayjs` bevosita import qilinadi.

## 7. Domen eslatmalari (backend bilan bog'liq)

- **Guruh narxi oyga bog'langan:** `group.monthlyFee` — *joriy oyda* amal qilayotgan narx.
  Narx tahrirlansa u **keyingi oydan** kuchga kiradi; reja `upcomingMonthlyFee` +
  `upcomingFeeFromMonth` da keladi. Tahrirlash modali inputni
  `upcomingMonthlyFee ?? monthlyFee` bilan to'ldiradi, "Shu oydan qo'llash" checkbox'i
  esa `applyFeeFrom: 'current_month'` yuboradi (xatoni tuzatish uchun).
  O'quvchining shaxsiy narxi (`student.monthlyFee`) bo'lsa — guruh narxi unga ta'sir qilmaydi.
- To'lov summalari backendda hisoblanadi; front faqat ko'rsatadi
  (`amountDue`, `amountPaid`, `remaining`, `payableNow`, `lessonsPlanned/Billable`,
  `isProrated`, `fullAmount`, `perLessonAmount`).
- Guruh `endDate` qisqartirilsa kelajakdagi darslar va to'lanmagan to'lovlar o'chadi —
  shuning uchun modalda tasdiq oynasi bor (`shortenConfirm`).
- **Xodim davomati:** `components/pages/staff-attendance/CheckInCard.vue` —
  "Keldim" tugmasi (`/today` va `/staff-attendance` sahifalarida). Bosilganda
  `navigator.geolocation` so'raladi, lekin **rad etilsa ham check-in ketaveradi** —
  faqat ishonchlilik pasayadi. `deviceId` localStorage'da saqlanadi (bitta
  telefondan bir necha xodim kirishini aniqlash uchun). Admin sahifasi —
  `views/staff-attendance/index.vue` (kunlik yozuvlar + hisobot).
  Markaz koordinatasi va Wi-Fi IP'si `CenterCreate.vue` ichida (faqat tahrirlashda).
  ⚠️ Geolokatsiya **faqat HTTPS yoki localhost** da ishlaydi.
- **Xodim sahifasi:** `components/pages/staff/StaffOverview.vue` — bitta komponent
  uchta joyda ishlatiladi: `/users/:id` (`views/staff/view.vue`, admin),
  `/my-performance` (`views/staff/my.vue`, xodimning o'zi) va `/payroll` dagi
  modal (ko'z belgisi). `show-actions` proprsi oylik to'lash va jarima yozish
  tugmalarini yoqadi; o'z sahifasida ular ko'rsatilmaydi.
  Jarima oylikdan katta bo'lsa qoldiq keyingi oyliklarga o'tadi — buni
  `summary.deductionOutstanding` ko'rsatadi.

## 8. Ma'lum muammolar

- `npm run lint` da ~278 ta eski xato bor (asosan `vue/valid-v-slot` — Vuetify
  `v-slot:item.xxx` uslubi va `vue/multi-word-component-names`). Ular loyiha bo'ylab
  mavjud; yangi kod ularning sonini oshirmasligi kerak.
- **Asosiy tekshiruv — `npm run type-check`** (u toza bo'lishi shart).
- Test yo'q (Vitest bu papkada sozlanmagan — u `cabinet_front_new/` da).
