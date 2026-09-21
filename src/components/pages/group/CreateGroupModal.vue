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
        <v-card-text class="py-2" v-if="isAdmin">
          <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.centerId"
              :items="centers"
              :label="$t('groups.form.center')"
              item-title="name"
              item-value="id"
              @update:modelValue="changedCenter"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
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
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            v-if="props.formForEdit?.id ? canEditGroup : canCreateGroup"
            type="submit"
            color="primary"
            :text="$t('groups.form.submit')"
            :loading="loading"
            :disabled="loading"
          ></v-btn>
        </template>
      </v-card>
    </Form>
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
import { computed, defineModel, ref, defineProps, defineEmits, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { WeekDay } from '@/types/groups.enum'
import { fetchSubjects } from '@/services/pages/subjects'
import { fetchUsers } from '@/services/pages/users'
import { createGroup, updateGroup } from '@/services/pages/groups'
import { fetchRooms } from '@/services/pages/rooms'
import type { GroupFormDays, GroupForm } from '@/types/groups.types'
import type { Center } from '@/types/center.types'
import type { User } from '@/types/users.types'
import type { Subject } from '@/types/subject.types'
import type { Room } from '@/types/room.types'
import type { Group } from '@/types/groups.types'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

const { canEditGroup, canCreateGroup, canViewSubjects, canViewRooms, canViewEmployees } =
  usePermissions()

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
const userStore = useUserStore()
const notify = useNotificationStore()
const { t } = useI18n()
// Markaz (filial) tanlay olish — rol nomiga emas, ruxsatga bog'liq
const isAdmin = computed(() => userStore.can('centers.view'))

interface Props {
  centers: Center[]
  formForEdit?: Group
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

watch(open, (newValue: boolean) => {
  console.log(props.formForEdit)
  if (newValue && props.formForEdit?.id) {
    form.value.name = props.formForEdit?.name || ''
    form.value.centerId = props.formForEdit?.center?.id
    form.value.subjectId = props.formForEdit?.subject?.id
    form.value.roomId = props.formForEdit?.room?.id
    form.value.teacherId = props.formForEdit?.teacher?.id
    form.value.monthlyFee = props.formForEdit?.monthlyFee ?? undefined
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
    endDate.value = null
    days.value = []
    allTimes.value = ''
    times.value = []
    differentTime.value = false

    // Admin bo'lmagan foydalanuvchilar uchun centerId'ni /auth/me'dan olamiz
    if (newValue && !isAdmin.value && userStore.user?.centerId) {
      form.value.centerId = userStore.user.centerId
      getSubjects()
      getUsers()
      getRooms()
    }
  }
})

const times = ref([])
const days = ref<GroupFormDays[]>([])
const allTimes = ref('')
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

function changedCenter() {
  form.value.subjectId = undefined
  form.value.teacherId = undefined
  form.value.roomId = undefined

  getSubjects()
  getUsers()
  getRooms()
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
    days: [],
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
