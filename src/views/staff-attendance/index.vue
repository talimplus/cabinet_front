<template>
  <div>
    <!-- O'z check-in kartochkasi (ruxsati bo'lganlarga) -->
    <CheckInCard ref="checkInCardRef" />

    <v-card>
      <v-card-title class="d-flex align-center flex-wrap pa-4" style="gap: 12px">
        <span class="text-h5">{{ $t('staffAttendance.title') }}</span>
        <v-spacer></v-spacer>
        <v-btn
          v-if="canManage"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-account-clock"
          @click="openManual"
        >
          {{ $t('staffAttendance.manual.button') }}
        </v-btn>
      </v-card-title>

      <!-- Markaz sozlanmagan bo'lsa tekshiruv ishlamaydi — buni yashirmaymiz -->
      <v-alert
        v-if="report?.centerNotConfigured"
        type="warning"
        variant="tonal"
        density="compact"
        class="mx-4 mb-2"
        :text="$t('staffAttendance.notConfigured')"
      ></v-alert>

      <v-tabs v-model="tab" bg-color="primary" slider-color="white">
        <v-tab value="log">{{ $t('staffAttendance.tabs.log') }}</v-tab>
        <v-tab value="report">{{ $t('staffAttendance.tabs.report') }}</v-tab>
      </v-tabs>

      <!-- Filtrlar -->
      <v-card-text class="pb-0">
        <v-row dense>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.from"
              type="date"
              :label="$t('staffAttendance.filter.from')"
              variant="outlined"
              density="compact"
              @update:model-value="reload"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="filters.to"
              type="date"
              :label="$t('staffAttendance.filter.to')"
              variant="outlined"
              density="compact"
              @update:model-value="reload"
            ></v-text-field>
          </v-col>
          <v-col v-if="tab === 'log'" cols="12" sm="6" md="3">
            <v-select
              v-model="filters.userId"
              :items="teacherOptions"
              item-title="title"
              item-value="value"
              :label="$t('staffAttendance.filter.staff')"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="loadLog"
            ></v-select>
          </v-col>
        </v-row>

        <div v-if="tab === 'log'" class="d-flex flex-wrap" style="gap: 16px">
          <v-checkbox
            v-model="filters.onlyLate"
            :label="$t('staffAttendance.filter.onlyLate')"
            density="compact"
            hide-details
            @update:model-value="loadLog"
          ></v-checkbox>
          <v-checkbox
            v-model="filters.onlyFlagged"
            :label="$t('staffAttendance.filter.onlyFlagged')"
            density="compact"
            hide-details
            @update:model-value="loadLog"
          ></v-checkbox>
        </div>
      </v-card-text>

      <v-window v-model="tab">
        <!-- ── Kunlik yozuvlar ─────────────────────────────── -->
        <v-window-item value="log">
          <v-card-text>
            <v-data-table
              :items="items"
              :headers="logHeaders"
              :loading="loading"
              hide-default-footer
              :items-per-page="filters.perPage"
            >
              <template #[`item.user`]="{ item }">
                {{ item.user ? `${item.user.firstName} ${item.user.lastName}` : '—' }}
              </template>

              <template #[`item.workDate`]="{ item }">
                {{ formatDate(item.workDate) }}
              </template>

              <template #[`item.checkInAt`]="{ item }">
                <div>{{ formatTime(item.checkInAt) }}</div>
                <div v-if="item.firstLessonAt" class="text-caption text-medium-emphasis">
                  {{ $t('staffAttendance.table.lessonAt', { time: item.firstLessonAt.slice(0, 5) }) }}
                </div>
              </template>

              <template #[`item.lateMinutes`]="{ item }">
                <span v-if="item.lateMinutes > 0" class="text-warning font-weight-medium">
                  +{{ item.lateMinutes }} {{ $t('staffAttendance.minutesShort') }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </template>

              <template #[`item.confidence`]="{ item }">
                <v-chip :color="confidenceColor(item.confidence)" size="small" variant="tonal">
                  {{ $t(`staffAttendance.confidence.${item.confidence}`) }}
                </v-chip>
                <div v-if="visibleFlags(item).length" class="text-caption text-medium-emphasis mt-1">
                  {{ visibleFlags(item).map((f) => $t(`staffAttendance.flags.${f}`)).join(' · ') }}
                </div>
              </template>

              <template #[`item.source`]="{ item }">
                <span class="text-caption">{{ $t(`staffAttendance.source.${item.source}`) }}</span>
                <v-icon
                  v-if="item.confirmedAt"
                  icon="mdi-shield-check"
                  color="success"
                  size="16"
                  class="ms-1"
                ></v-icon>
              </template>

              <template #[`item.actions`]="{ item }">
                <div class="d-flex">
                  <v-btn
                    v-if="canManage && !item.confirmedAt"
                    icon="mdi-check-decagram"
                    size="small"
                    variant="text"
                    color="success"
                    :title="$t('staffAttendance.confirmAction')"
                    @click="confirmRow(item)"
                  ></v-btn>
                  <v-btn
                    v-if="canManage"
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="medium-emphasis"
                    @click="removeRow(item)"
                  ></v-btn>
                </div>
              </template>
            </v-data-table>

            <v-pagination
              v-if="totalPages > 1"
              v-model="filters.page"
              :length="totalPages"
              class="mt-4"
              @update:model-value="loadLog"
            ></v-pagination>
          </v-card-text>
        </v-window-item>

        <!-- ── Hisobot ─────────────────────────────────────── -->
        <v-window-item value="report">
          <v-card-text>
            <v-data-table
              :items="report?.rows ?? []"
              :headers="reportHeaders"
              :loading="loadingReport"
              hide-default-footer
              :items-per-page="-1"
            >
              <template #[`item.user`]="{ item }">
                {{ `${item.user.firstName} ${item.user.lastName}` }}
              </template>

              <template #[`item.missedDays`]="{ item }">
                <span v-if="item.missedDays > 0" class="text-error font-weight-medium">
                  {{ item.missedDays }}
                </span>
                <span v-else class="text-medium-emphasis">0</span>
              </template>

              <template #[`item.totalLateMinutes`]="{ item }">
                <span v-if="item.totalLateMinutes > 0" class="text-warning font-weight-medium">
                  {{ formatDuration(item.totalLateMinutes) }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </template>

              <template #[`item.flaggedDays`]="{ item }">
                <v-chip v-if="item.flaggedDays > 0" color="warning" size="small" variant="tonal">
                  {{ item.flaggedDays }}
                </v-chip>
                <span v-else class="text-medium-emphasis">—</span>
              </template>
            </v-data-table>

            <div class="text-caption text-medium-emphasis mt-3">
              {{ $t('staffAttendance.report.hint') }}
            </div>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Qo'lda kiritish -->
    <v-dialog v-model="manualDialog" width="440">
      <v-card :title="$t('staffAttendance.manual.title')">
        <v-card-text>
          <v-select
            v-model="manualForm.userId"
            :items="teacherOptions"
            item-title="title"
            item-value="value"
            :label="$t('staffAttendance.manual.staff')"
            variant="outlined"
            density="compact"
          ></v-select>
          <v-text-field
            v-model="manualForm.workDate"
            type="date"
            :label="$t('staffAttendance.manual.date')"
            variant="outlined"
            density="compact"
          ></v-text-field>
          <v-text-field
            v-model="manualForm.checkInTime"
            type="time"
            :label="$t('staffAttendance.manual.time')"
            variant="outlined"
            density="compact"
          ></v-text-field>
          <v-textarea
            v-model="manualForm.note"
            :label="$t('staffAttendance.manual.note')"
            variant="outlined"
            density="compact"
            rows="2"
          ></v-textarea>
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            :text="$t('staffAttendance.manual.hint')"
          ></v-alert>
        </v-card-text>
        <template #actions>
          <v-btn :text="$t('common.cancel')" @click="manualDialog = false"></v-btn>
          <v-btn
            color="primary"
            :loading="manualLoading"
            :disabled="!manualForm.userId"
            :text="$t('common.save')"
            @click="submitManual"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'
import CheckInCard from '@/components/pages/staff-attendance/CheckInCard.vue'
import { fetchAllTeachers } from '@/services/pages/users'
import {
  confirmStaffAttendance,
  createManualAttendance,
  deleteStaffAttendance,
  fetchStaffAttendance,
  fetchStaffAttendanceReport,
} from '@/services/pages/staffAttendance'
import type { TeacherListItem } from '@/types/users.types'
import type {
  AttendanceConfidence,
  ManualCheckInForm,
  StaffAttendance,
  StaffAttendanceReport,
} from '@/types/staffAttendance.types'

defineOptions({ name: 'StaffAttendancePage' })

const { t } = useI18n()
const notify = useNotificationStore()
const { can, canViewTeachers } = usePermissions()

const canManage = computed(() => can('staffAttendance.manage'))

const tab = ref<'log' | 'report'>('log')
const checkInCardRef = ref()

const today = new Date()
const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const filters = ref({
  userId: undefined as number | undefined,
  from: toIso(firstOfMonth),
  to: toIso(today),
  onlyLate: false,
  onlyFlagged: false,
  page: 1,
  perPage: 20,
})

const items = ref<StaffAttendance[]>([])
const total = ref(0)
const loading = ref(false)

const report = ref<StaffAttendanceReport | null>(null)
const loadingReport = ref(false)

const teachers = ref<TeacherListItem[]>([])

const manualDialog = ref(false)
const manualLoading = ref(false)
const manualForm = ref<ManualCheckInForm>({
  userId: null,
  workDate: toIso(today),
  checkInTime: '09:00',
  note: '',
})

const totalPages = computed(() => Math.ceil(total.value / filters.value.perPage) || 1)

const teacherOptions = computed(() =>
  teachers.value.map((teacher) => ({
    title: `${teacher.firstName} ${teacher.lastName}`,
    value: teacher.id,
  })),
)

const logHeaders = computed(() => [
  { title: t('staffAttendance.table.staff'), key: 'user', sortable: false },
  { title: t('staffAttendance.table.date'), key: 'workDate', sortable: false },
  { title: t('staffAttendance.table.arrived'), key: 'checkInAt', sortable: false },
  { title: t('staffAttendance.table.late'), key: 'lateMinutes', sortable: false },
  { title: t('staffAttendance.table.confidence'), key: 'confidence', sortable: false },
  { title: t('staffAttendance.table.source'), key: 'source', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

const reportHeaders = computed(() => [
  { title: t('staffAttendance.table.staff'), key: 'user', sortable: false },
  { title: t('staffAttendance.report.expectedDays'), key: 'expectedDays', sortable: false },
  { title: t('staffAttendance.report.attendedDays'), key: 'attendedDays', sortable: false },
  { title: t('staffAttendance.report.missedDays'), key: 'missedDays', sortable: false },
  { title: t('staffAttendance.report.lateDays'), key: 'lateDays', sortable: false },
  {
    title: t('staffAttendance.report.totalLate'),
    key: 'totalLateMinutes',
    sortable: false,
  },
  { title: t('staffAttendance.report.flagged'), key: 'flaggedDays', sortable: false },
])

const confidenceColor = (confidence: AttendanceConfidence): string => {
  if (confidence === 'high') return 'success'
  if (confidence === 'medium') return 'warning'
  return 'error'
}

/** "Bugun darsi yo'q" ayblov emas — jadvalda ko'rsatmaymiz */
const visibleFlags = (row: StaffAttendance) =>
  (row.flags ?? []).filter((flag) => flag !== 'no_lesson_today')

const formatDate = (value: string): string => {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

const formatTime = (iso: string): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} ${t('staffAttendance.minutesShort')}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest
    ? `${hours} ${t('staffAttendance.hoursShort')} ${rest} ${t('staffAttendance.minutesShort')}`
    : `${hours} ${t('staffAttendance.hoursShort')}`
}

const loadLog = async () => {
  try {
    loading.value = true
    const { data } = await fetchStaffAttendance({
      page: filters.value.page,
      perPage: filters.value.perPage,
      userId: filters.value.userId,
      from: filters.value.from || undefined,
      to: filters.value.to || undefined,
      onlyLate: filters.value.onlyLate || undefined,
      onlyFlagged: filters.value.onlyFlagged || undefined,
    })
    items.value = data?.data ?? []
    total.value = data?.meta?.total ?? 0
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const loadReport = async () => {
  if (!filters.value.from || !filters.value.to) return
  try {
    loadingReport.value = true
    report.value = await fetchStaffAttendanceReport({
      from: filters.value.from,
      to: filters.value.to,
    })
  } catch (error) {
    console.error(error)
  } finally {
    loadingReport.value = false
  }
}

const reload = () => {
  filters.value.page = 1
  loadLog()
  loadReport()
}

const confirmRow = async (row: StaffAttendance) => {
  try {
    await confirmStaffAttendance(row.id)
    notify.success(t('staffAttendance.messages.confirmed'))
    await loadLog()
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  }
}

const removeRow = async (row: StaffAttendance) => {
  if (!window.confirm(t('common.confirmDelete'))) return
  try {
    await deleteStaffAttendance(row.id)
    notify.success(t('staffAttendance.messages.deleted'))
    await loadLog()
    await loadReport()
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  }
}

const openManual = () => {
  manualForm.value = {
    userId: null,
    workDate: toIso(new Date()),
    checkInTime: '09:00',
    note: '',
  }
  manualDialog.value = true
}

const submitManual = async () => {
  try {
    manualLoading.value = true
    await createManualAttendance(manualForm.value)
    manualDialog.value = false
    notify.success(t('staffAttendance.messages.manualSaved'))
    await loadLog()
    await loadReport()
    checkInCardRef.value?.load()
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  } finally {
    manualLoading.value = false
  }
}

watch(tab, (value) => {
  if (value === 'report' && !report.value) loadReport()
})

onMounted(async () => {
  if (canViewTeachers.value) {
    try {
      teachers.value = await fetchAllTeachers()
    } catch (error) {
      console.error(error)
    }
  }
  await loadLog()
  await loadReport()
})
</script>
