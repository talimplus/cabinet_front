<template>
  <v-dialog v-model="open" width="750">
    <Form @submit="submit" ref="groupFormRef">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between py-4">
          <span class="text-h6 font-weight-bold">
            {{ props.formForEdit?.id ? $t('groups.form.editTitle') : $t('groups.form.addTitle') }}
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="open = false"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="py-2">
          <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              :label="$t('groups.form.name')"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text class="py-2" v-if="canViewSubjects">
          <Field name="subjectId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.subjectId"
              :items="subjects"
              :label="$t('groups.form.subject')"
              :disabled="!form.centerId"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>

        <v-card-text class="py-2" v-if="canViewRooms">
          <Field name="roomId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.roomId"
              :items="rooms"
              :label="$t('groups.form.room')"
              :disabled="!form.centerId"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>

        <v-card-text class="py-2" v-if="canViewEmployees">
          <Field name="teacherId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.teacherId"
              :items="users"
              :disabled="!form.centerId"
              :label="$t('groups.form.teacher')"
              item-title="fullName"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>
        <v-card-text class="py-2">
          <Field name="monthlyFee" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.monthlyFee"
              :label="$t('groups.form.monthlyFee')"
              type="number"
              variant="outlined"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>

          <!--
            Narx oy o'rtasida o'zgartirilsa ham keyingi oydan kuchga kiradi:
            joriy oy to'lovlari (to'langan ham, to'lanmagan ham) o'zgarmaydi.
          -->
          <v-alert
            v-if="feeChanged"
            :type="applyFeeNow ? 'warning' : 'info'"
            variant="tonal"
            density="compact"
            class="mt-1"
          >
            <template v-if="applyFeeNow">
              {{ $t('groups.form.feeApplyNowWarning', { fee: formatCurrency(currentFee) }) }}
            </template>
            <template v-else>
              {{ $t('groups.form.feeNextMonthHint', { month: nextMonthLabel }) }}
              <template v-if="currentFee !== null">
                {{ $t('groups.form.feeCurrentMonth', { fee: formatCurrency(currentFee) }) }}
              </template>
            </template>
          </v-alert>

          <v-checkbox
            v-if="feeChanged"
            v-model="applyFeeNow"
            density="compact"
            hide-details
            :label="$t('groups.form.applyFeeNow')"
          ></v-checkbox>
        </v-card-text>
        <v-card-text class="py-2">
          <Field name="endDate" v-slot="{ handleChange, handleBlur, errors }">
            <v-date-input
              v-model="endDate"
              :label="$t('groups.form.endDate')"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              variant="outlined"
              clearable
              :min="startDateISO"
              :error-messages="endDateError ? [endDateError] : errors"
              :hint="$t('groups.form.endDateHint')"
              persistent-hint
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-date-input>
          </Field>
          <!-- Tugash sanasi bo'sh bo'lsa guruh muddatsiz bo'ladi -->
          <v-alert
            v-if="!endDate"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            <span class="font-weight-medium">{{ $t('groups.noEndDate') }}</span>
            — {{ $t('groups.noEndDateHint') }}
          </v-alert>
        </v-card-text>
        <v-card-text class="py-2">
          <div class="d-flex align-center flex-wrap mb-2" style="gap: 12px">
            <Field name="lessonDurationMinutes" v-slot="{ handleChange, handleBlur, errors }">
              <v-text-field
                v-model="lessonDuration"
                :label="$t('groups.form.lessonDuration')"
                type="number"
                min="5"
                max="600"
                variant="outlined"
                density="compact"
                hide-details="auto"
                style="max-width: 220px"
                :suffix="$t('groups.form.minutesShort')"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-text-field>
            </Field>
            <v-spacer></v-spacer>
            <!-- Modalni yopmasdan xona bo'shligini ko'rish -->
            <v-btn
              v-if="canViewSchedule"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-calendar-clock"
              @click="scheduleDialog = true"
            >
              {{ $t('schedule.viewButton') }}
            </v-btn>
          </div>

          <v-row dense>
            <v-col cols="12" sm="6">
              <Field name="days" v-slot="{ handleChange, handleBlur, errors }">
                <v-autocomplete
                  :placeholder="$t('groups.form.selectDays')"
                  :items="dayList"
                  multiple
                  chips
                  v-model="days"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </v-col>
            <v-col cols="12" sm="6" class="d-flex">
              <Field name="allTimes" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-if="!differentTime"
                  :placeholder="$t('groups.form.name')"
                  type="time"
                  style="height: 48px!important; min-height: 48px!important; max-height: 48px!important;"
                  v-model="allTimes"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
              <Field name="differentTime" v-slot="{ handleChange, handleBlur }">
                <v-checkbox
                  :label="$t('groups.form.differentTime')"
                  v-model="differentTime"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </v-col>
            <template v-if="differentTime">
              <v-col cols="12" sm="6" v-for="(day, i) in days" :key="`day-${i}`">
                <Field :name="`times.${i}`" v-slot="{ handleChange, handleBlur, errors }">
                  <v-text-field
                    :label="day"
                    type="time"
                    v-model="times[i]"
                    :error-messages="errors"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </v-col>
            </template>
          </v-row>

          <!--
            Bandlik saqlashdan OLDIN tekshiriladi: foydalanuvchi vaqtni
            tanlagan zahoti javob oladi. Backend saqlashda baribir qayta
            tekshiradi (422 -> roomId/teacherId maydonlari).
          -->
          <div v-if="conflictChecking" class="text-body-2 text-medium-emphasis mt-3">
            <v-progress-circular indeterminate size="14" width="2" class="me-2"></v-progress-circular>
            {{ $t('schedule.conflict.checking') }}
          </div>

          <v-alert
            v-else-if="conflicts.length"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            <div class="font-weight-medium mb-1">{{ $t('schedule.conflict.title') }}</div>
            <ul class="conflict-list">
              <li v-for="(message, index) in conflictMessages" :key="`conflict-${index}`">
                {{ message }}
              </li>
            </ul>
            <div class="text-body-2 mt-2">{{ $t('schedule.conflict.hint') }}</div>
          </v-alert>

          <v-alert
            v-else-if="conflictChecked && scheduleSlots.length"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-3"
            :text="$t('schedule.conflict.free')"
          ></v-alert>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            v-if="props.formForEdit?.id ? canEditGroup : canCreateGroup"
            type="submit"
            color="primary"
            :text="$t('groups.form.submit')"
            :loading="loading"
            :disabled="loading || conflicts.length > 0"
          ></v-btn>
        </template>
      </v-card>
    </Form>
  </v-dialog>

  <!-- Jadval: modal yopilmaydi, foydalanuvchi bo'sh vaqtni ko'rib qaytadi -->
  <v-dialog v-model="scheduleDialog" width="1100" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4">
        <span class="text-h6 font-weight-bold">{{ $t('schedule.dialogTitle') }}</span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="scheduleDialog = false"></v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <ScheduleBoard
          v-if="scheduleDialog"
          :highlight-room-id="form.roomId ?? null"
          :initial-day="days[0] ?? null"
        />
      </v-card-text>
    </v-card>
  </v-dialog>

  <!-- Tugash sanasi qisqartirilganda tasdiqlash -->
  <v-dialog v-model="shortenConfirm" width="480">
    <v-card>
      <v-card-title class="text-h6 font-weight-bold">
        {{ $t('groups.form.shortenTitle') }}
      </v-card-title>
      <v-card-text>{{ $t('groups.form.shortenText') }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" :disabled="loading" @click="shortenConfirm = false">
          {{ $t('common.cancel') }}
        </v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="confirmShorten">
          {{ $t('groups.form.confirm') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { usePermissions } from '@/composables/usePermissions'
import { computed, defineModel, nextTick, ref, defineProps, defineEmits, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { WeekDay } from '@/types/groups.enum'
import { fetchSubjects } from '@/services/pages/subjects'
import { fetchUsers } from '@/services/pages/users'
import { createGroup, updateGroup } from '@/services/pages/groups'
import { fetchRooms } from '@/services/pages/rooms'
import { checkScheduleConflicts } from '@/services/pages/schedule'
import { useDebounceFn } from '@/composables/useDebounceFn'
import ScheduleBoard from '@/components/pages/schedule/ScheduleBoard.vue'
import type { ScheduleConflict } from '@/types/schedule.types'
import type { GroupForm } from '@/types/groups.types'
import type { User } from '@/types/users.types'
import type { Subject } from '@/types/subject.types'
import type { Room } from '@/types/room.types'
import type { Group } from '@/types/groups.types'
import { useCenterStore } from '@/stores/center'
import { useNotificationStore } from '@/stores/notification'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const {
  canEditGroup,
  canCreateGroup,
  canViewSubjects,
  canViewRooms,
  canViewEmployees,
  canViewSchedule,
} = usePermissions()

// Backend xatoliklari: 422 — {errors: {field: msg}}, 400 — {message}
interface ApiErrorData {
  message?: string | string[]
  errors?: Record<string, string | string[]>
}
const errorData = (err: unknown): ApiErrorData | undefined =>
  (err as { response?: { data?: ApiErrorData } })?.response?.data
const firstMessage = (value?: string | string[]): string =>
  (Array.isArray(value) ? value[0] : value) || ''

const subjects = ref<Subject[]>([])
const users = ref<User[]>([])
const rooms = ref<Room[]>([])
const notify = useNotificationStore()
const centerStore = useCenterStore()
const { t } = useI18n()

interface Props {
  formForEdit?: Group
  /**
   * Tashqaridan (masalan statusni o'zgartirishda) kelgan maydon xatolari.
   * Forma ochilganda shu inputlar ostida ko'rsatiladi.
   */
  statusErrors?: Record<string, string | string[]>
}

interface Emits {
  (e: 'updateData'): void
  (e: 'clearEditForm'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const open = defineModel('open', { type: Boolean })
const differentTime = ref(false)
const loading = ref(false)
const groupFormRef = ref()
const form = ref<GroupForm>({
  name: '',
  subjectId: undefined,
  teacherId: undefined,
  roomId: undefined,
  monthlyFee: undefined,
  days: [],
  centerId: '',
})

// Darslar tugash sanasi (ixtiyoriy). Bo'sh bo'lsa guruh muddatsiz.
const endDate = ref<Date | null>(null)
const shortenConfirm = ref(false)

// Narx: default holatda yangi narx keyingi oydan kuchga kiradi.
// Bu checkbox faqat xato kiritilgan narxni shu oyda tuzatish uchun.
const applyFeeNow = ref(false)

const formatCurrency = (amount?: number | null): string => {
  if (amount === null || amount === undefined) return '—'
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0) + " so'm"
  )
}

/** Joriy oyda amal qilayotgan narx (backend `monthlyFee` shuni qaytaradi). */
const currentFee = computed<number | null>(() => props.formForEdit?.monthlyFee ?? null)

/** Formadagi narx joriy amaldagi narxdan farq qilyaptimi (faqat tahrirlashda). */
const feeChanged = computed(() => {
  if (!props.formForEdit?.id) return false
  const raw = form.value.monthlyFee
  if (raw === undefined || raw === null || raw === '') return false
  return +raw !== Number(currentFee.value ?? 0)
})

/** Yangi narx kuchga kiradigan oy — foydalanuvchiga ko'rsatish uchun. */
const nextMonthLabel = computed(() => dayjs().add(1, 'month').startOf('month').format('DD.MM.YYYY'))

// YYYY-MM-DD ko'rinishiga keltirish — backend shu formatni kutadi
const toISODate = (value?: Date | string | null): string | null => {
  if (!value) return null
  const d = dayjs(value)
  return d.isValid() ? d.format('YYYY-MM-DD') : null
}

// Guruh boshlanish sanasi: tugash sanasi undan oldin bo'lishi mumkin emas
const startDateISO = computed(() => toISODate(props.formForEdit?.startDate) ?? undefined)
const selectedEndDate = computed(() => toISODate(endDate.value))
const previousEndDate = computed(() => toISODate(props.formForEdit?.endDate))

const endDateError = computed(() => {
  const iso = selectedEndDate.value
  if (!iso || !startDateISO.value) return ''
  return iso < startDateISO.value ? t('groups.form.endDateBeforeStart') : ''
})

// Sana qisqartirilyaptimi — bunda darslar va to'lanmagan to'lovlar o'chadi
const isShortening = computed(() => {
  const iso = selectedEndDate.value
  const prev = previousEndDate.value
  if (!iso || !prev) return false
  return iso < prev
})

watch(open, async (newValue: boolean) => {
  console.log(props.formForEdit)
  if (newValue && props.formForEdit?.id) {
    form.value.name = props.formForEdit?.name || ''
    form.value.centerId = props.formForEdit?.center?.id
    form.value.subjectId = props.formForEdit?.subject?.id
    form.value.roomId = props.formForEdit?.room?.id
    form.value.teacherId = props.formForEdit?.teacher?.id
    // Rejalashtirilgan (keyingi oydan kuchga kiradigan) narx bo'lsa — inputda
    // aynan o'sha ko'rinadi, aks holda admin narxni qayta kiritib yuboradi.
    form.value.monthlyFee =
      props.formForEdit?.upcomingMonthlyFee ?? props.formForEdit?.monthlyFee ?? undefined
    applyFeeNow.value = false
    lessonDuration.value = props.formForEdit?.lessonDurationMinutes ?? 90
    conflicts.value = []
    conflictChecked.value = false
    endDate.value = props.formForEdit?.endDate ? dayjs(props.formForEdit.endDate).toDate() : null

    // Convert schedules to days format
    if (props.formForEdit?.schedules && props.formForEdit.schedules.length > 0) {
      days.value = props.formForEdit.schedules.map((schedule) => schedule.day)
      if (props.formForEdit.schedules.length === 1) {
        allTimes.value = props.formForEdit.schedules[0].startTime
        differentTime.value = false
      } else {
        differentTime.value = true
        times.value = props.formForEdit.schedules.map((schedule) => schedule.startTime)
      }
    } else {
      days.value = []
      allTimes.value = ''
      times.value = []
      differentTime.value = false
    }

    getSubjects()
    getUsers()
    getRooms()

    // Statusni o'zgartirishda yetishmagan maydonlar (endDate/roomId) —
    // xato aynan shu inputlar ostida chiqishi uchun maydonlar
    // render bo'lgandan keyin qo'yiladi.
    await nextTick()
    if (props.statusErrors && Object.keys(props.statusErrors).length) {
      groupFormRef.value?.setErrors(props.statusErrors)
    }
  } else {
    emits('clearEditForm')
    form.value = {
      name: '',
      subjectId: undefined,
      teacherId: undefined,
      roomId: undefined,
      monthlyFee: undefined,
      days: [],
      centerId: '',
    }
    applyFeeNow.value = false
    lessonDuration.value = 90
    conflicts.value = []
    conflictChecked.value = false
    endDate.value = null
    days.value = []
    allTimes.value = ''
    times.value = []
    differentTime.value = false

    // Filial header'dan: guruh aktiv filialga (yoki "barchasi" bo'lsa —
    // standart filialga) yaratiladi. Fan/ustoz/xona ro'yxati ham shu filialdan.
    if (newValue) {
      // Filiallar hali yuklanmagan bo'lishi mumkin (to'g'ridan-to'g'ri linkdan kirish)
      await centerStore.load()
      form.value.centerId = centerStore.centerIdForCreate ?? ''
      getSubjects()
      getUsers()
      getRooms()
    }
  }
})

const times = ref<string[]>([])
// Bu yerda faqat kun nomlari turadi (vaqt alohida: `allTimes` / `times`)
const days = ref<WeekDay[]>([])
const allTimes = ref('')

// ── Dars davomiyligi va bandlik tekshiruvi ─────────────────────────────
// Davomiylik guruh darajasida saqlanadi: xona/o'qituvchi bandligi
// [startTime .. startTime + davomiylik) oralig'i bo'yicha hisoblanadi.
const DEFAULT_LESSON_DURATION = 90

const lessonDuration = ref<number | string>(DEFAULT_LESSON_DURATION)
const scheduleDialog = ref(false)
const conflicts = ref<ScheduleConflict[]>([])
const conflictChecking = ref(false)
const conflictChecked = ref(false)

/** Formadagi jadval: kun + boshlanish vaqti (bo'sh qatorlar tashlanadi) */
const scheduleSlots = computed(() =>
  days.value
    .map((day, i) => ({
      day,
      startTime: differentTime.value ? times.value[i] || '' : allTimes.value,
    }))
    .filter((slot) => Boolean(slot.day && slot.startTime)),
)

const durationNumber = computed(() => {
  const raw = Number(lessonDuration.value)
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_LESSON_DURATION
})

const conflictMessages = computed(() =>
  conflicts.value.map((conflict) =>
    t(`schedule.conflict.${conflict.reason}`, {
      day: t(`schedule.days.${conflict.day}`),
      time: `${conflict.requestedStartTime}–${conflict.requestedEndTime}`,
      room: conflict.roomName ?? '—',
      teacher: conflict.teacherName ?? '—',
      group: conflict.groupName,
      busy: `${conflict.startTime}–${conflict.endTime}`,
    }),
  ),
)

const runConflictCheck = async () => {
  const slots = scheduleSlots.value
  // Xona ham, o'qituvchi ham tanlanmagan bo'lsa tekshiradigan narsa yo'q
  if (!slots.length || (!form.value.roomId && !form.value.teacherId)) {
    conflicts.value = []
    conflictChecked.value = false
    return
  }

  try {
    conflictChecking.value = true
    conflicts.value = await checkScheduleConflicts({
      days: slots,
      roomId: form.value.roomId,
      teacherId: form.value.teacherId,
      lessonDurationMinutes: durationNumber.value,
      excludeGroupId: props.formForEdit?.id,
    })
    conflictChecked.value = true
  } catch (err) {
    // Tekshiruv ishlamay qolsa saqlashni bloklamaymiz — backend baribir tekshiradi
    conflicts.value = []
    conflictChecked.value = false
    console.log(err)
  } finally {
    conflictChecking.value = false
  }
}

const debouncedConflictCheck = useDebounceFn(runConflictCheck, 400)

watch(
  [
    () => form.value.roomId,
    () => form.value.teacherId,
    scheduleSlots,
    durationNumber,
    open,
  ],
  () => {
    if (!open.value) return
    conflicts.value = []
    debouncedConflictCheck()
  },
  { deep: true },
)
const dayList = computed(() => {
  return [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
    WeekDay.SUNDAY,
  ]
})

const getUsers = async () => {
  if (!canViewEmployees.value) return
  try {
    const {
      data: { data },
    } = await fetchUsers({ centerId: form.value.centerId })
    // Ustoz sifatida faqat role'i "teacher" bo'lgan xodimlarni tanlash mumkin
    users.value = data
      .filter((item) => item.role === 'teacher')
      .map((item) => {
        item.fullName = item.firstName + ' ' + item.lastName
        return item
      })
  } catch (err) {
    console.log(err)
  }
}

const getSubjects = async () => {
  if (!canViewSubjects.value) return
  try {
    const {
      data: { data },
    } = await fetchSubjects({
      centerId: form.value.centerId,
    })
    subjects.value = data
  } catch (err) {
    console.log(err)
  }
}

const getRooms = async () => {
  if (!canViewRooms.value) return
  try {
    const {
      data: { data },
    } = await fetchRooms({ centerId: form.value.centerId })

    rooms.value = data
  } catch (err) {
    console.log(err)
  }
}

const submit = async () => {
  if (endDateError.value) return
  // Sana qisqartirilsa avval tasdiqlatamiz
  if (isShortening.value) {
    shortenConfirm.value = true
    return
  }
  await save()
}

const confirmShorten = async () => {
  shortenConfirm.value = false
  await save()
}

const save = async () => {
  // Prepare form data
  // Handle monthlyFee: if it's a valid number (including 0), use it; otherwise send null

  const submitData: GroupForm = {
    name: form.value.name,
    centerId: form.value.centerId,
    subjectId: form.value.subjectId,
    teacherId: form.value.teacherId,
    roomId: form.value.roomId,
    monthlyFee:
      form.value.monthlyFee !== undefined &&
      form.value.monthlyFee !== null &&
      form.value.monthlyFee !== ''
        ? +form.value.monthlyFee
        : null,
    // null yuborilsa muddat olib tashlanadi (guruh muddatsiz bo'ladi)
    endDate: selectedEndDate.value,
    lessonDurationMinutes: durationNumber.value,
    days: [],
  }

  // Narx o'zgargan bo'lsa: default — keyingi oydan. Checkbox belgilansa —
  // shu oydan (xatoni tuzatish) va joriy oyning ochiq to'lovlari qayta hisoblanadi.
  if (feeChanged.value) {
    submitData.applyFeeFrom = applyFeeNow.value ? 'current_month' : 'next_month'
  }

  // Convert days and times to days array
  days.value.forEach((day, i) => {
    if (day) {
      submitData.days?.push({
        day: day,
        startTime: differentTime.value ? times.value[i] || '' : allTimes.value,
      })
    }
  })

  // Remove empty days array if no days selected
  if (submitData.days && submitData.days.length === 0) {
    delete submitData.days
  }

  // Yaratishda bo'sh sanani umuman yubormaymiz
  if (!props.formForEdit?.id && submitData.endDate === null) {
    delete submitData.endDate
  }

  try {
    loading.value = true
    if (props.formForEdit?.id) {
      await updateGroup(submitData, props.formForEdit.id)
    } else {
      await createGroup(submitData)
    }
    shortenConfirm.value = false
    open.value = false
    // endDate o'zgarganda backend guruh statusi, o'quvchilar va to'lovlarni ham
    // qayta hisoblaydi — shuning uchun ro'yxatlarni qaytadan yuklaymiz
    emits('updateData')
  } catch (err) {
    const response = errorData(err)
    if (response?.errors) {
      // 422 — maydonga bog'liq validatsiya, xabar shu input ostida chiqadi
      groupFormRef.value?.setErrors(response.errors)
    } else {
      // 400 — umumiy biznes qoidasi
      notify.error(firstMessage(response?.message) || t('groups.form.saveError'))
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
