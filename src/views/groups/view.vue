<template>
  <v-container fluid class="pa-2 pa-md-4 group-view">
  <v-card>
      <v-card-title class="text-h5 pa-3 pa-md-4 d-flex align-center" style="gap: 8px">
        <v-btn variant="text" icon="mdi-arrow-left" size="small" @click="goBack"></v-btn>
        <span class="text-truncate">{{ group?.name || $t('groups.view.title') }}</span>
      </v-card-title>

      <v-tabs v-model="activeTab" bg-color="primary" slider-color="white">
        <v-tab v-if="canManageAttendance" value="attendance">{{ $t('groups.tabs.attendance') }}</v-tab>
        <v-tab v-if="!isReception" value="plan">{{ $t('groups.tabs.plan') }}</v-tab>
        <v-tab value="students">{{ $t('groups.tabs.students') }}</v-tab>
        <v-tab value="info">{{ $t('groups.tabs.info') }}</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- TAB 1: ATTENDANCE -->
        <v-window-item value="attendance">
          <v-card-text>
            <!-- Month Filter (year + month) -->
            <v-row class="mb-4">
              <v-col cols="6" md="3">
                <v-select
                  v-model="selectedMonth"
                  :items="monthOptions"
                  item-title="label"
                  item-value="value"
                  :label="$t('groups.attendance.month')"
                  density="compact"
                  variant="outlined"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="6" md="3">
                <v-select
                  v-model="selectedYear"
                  :items="yearOptions"
                  :label="$t('groups.attendance.year')"
                  density="compact"
                  variant="outlined"
                  hide-details
                ></v-select>
              </v-col>
              <v-col cols="12" md="3" class="d-flex align-center" style="gap: 8px">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  @click="goToCurrentMonth"
                  prepend-icon="mdi-calendar-today"
                >
                  {{ $t('groups.attendance.currentMonth') }}
                </v-btn>
              </v-col>
            </v-row>

            <!-- Attendance Matrix -->
            <div v-if="loadingAttendance" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="students.length === 0" class="text-center pa-8 text-medium-emphasis">
              {{ $t('groups.attendance.noStudents') }}
            </div>

            <div v-else class="attendance-matrix">
              <div class="attendance-table-wrapper">
                <table class="attendance-table">
                  <thead>
                    <tr>
                      <th class="student-column sticky">{{ $t('groups.attendance.student') }}</th>
                      <th
                        v-for="date in lessonDates"
                        :key="date"
                        class="date-column"
                        :class="{ 'today-column': date === today }"
                      >
                        <div class="date-header">
                          {{ formatDateHeader(date) }}
                          <div
                            v-if="getOverrideType(date)"
                            class="override-label"
                            :class="{
                              cancelled: isCancelledDate(date),
                              extra: isExtraDate(date),
                            }"
                          >
                            {{ getOverrideLabel(date) }}
                          </div>
                          <v-btn
                            v-if="canRescheduleDate(date)"
                            size="x-small"
                            variant="text"
                            color="primary"
                            icon="mdi-calendar-sync"
                            @click.stop="openReschedule(date)"
                          ></v-btn>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in students" :key="student.id">
                      <td class="student-column sticky">
                        <div class="student-name">
                          {{ `${student.firstName} ${student.lastName}` }}
                        </div>
                      </td>
                      <td
                        v-for="date in lessonDates"
                        :key="`${student.id}-${date}`"
                        class="attendance-cell"
                        :class="{
                          'cell-today': isToday(date),
                          'cell-past': isPast(date),
                          'cell-future': isFuture(date),
                          'cell-cancelled': isCancelledDate(date),
                          'cell-editable': canEditCell(date),
                        }"
                        @click="handleCellClick($event, student.id, date)"
                      >
                        <div class="cell-content" :title="getCellComment(student.id, date)">
                          <v-icon
                            :color="getCellIconColor(student.id, date)"
                            :icon="getCellIcon(student.id, date)"
                            size="24"
                            :class="{
                              'icon-past': isPast(date),
                              'icon-future': isFuture(date),
                            }"
                          ></v-icon>
                          <span
                            v-if="getCellComment(student.id, date)"
                            class="comment-dot"
                          ></span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- TAB 2: LESSON PLAN -->
        <v-window-item value="plan">
          <GroupPlanTab
            v-if="planTabVisited && groupId"
            :group-id="groupId"
            :is-own-group="isOwnGroup"
          />
        </v-window-item>

        <!-- TAB 3: STUDENTS -->
        <v-window-item value="students">
          <v-card-text>
            <v-data-table
              :items="students"
              :headers="studentHeaders"
              :loading="loadingStudents"
              :items-per-page="10"
              class="elevation-0"
            >
              <template v-slot:item.fullName="{ item }">
                {{ `${item.firstName} ${item.lastName}` }}
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
                  {{ item.status }}
                </v-chip>
      </template>
    </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- TAB 4: GROUP INFO -->
        <v-window-item value="info">
          <v-card-text v-if="loadingGroup" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-card-text>

          <v-card-text v-else-if="group">
            <!-- Basic Info -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6 pa-4">{{ $t('groups.info.basicInfo') }}</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.groupName') }}</span>
                      <span class="info-value">{{ group.name }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.center') }}</span>
                      <span class="info-value">{{ group.center?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.subject') }}</span>
                      <span class="info-value">{{ group.subject?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.teacher') }}</span>
                      <span class="info-value">
                        {{
                          group.teacher
                            ? `${group.teacher.firstName} ${group.teacher.lastName}`
                            : $t('groups.info.notAssigned')
                        }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.room') }}</span>
                      <span class="info-value">{{ group.room?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('common.status') }}</span>
                      <v-chip
                        class="status-chip"
                        :color="getGroupStatusColor(group.status)"
                        size="small"
                        variant="flat"
                      >
                        {{ group.status || $t('common.active') }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.duration') }}</span>
                      <span class="info-value">
                        {{ group.durationMonths ?? '—' }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.startDate') }}</span>
                      <span class="info-value">
                        {{ group.startDate ? formatDate(group.startDate) : '—' }}
                      </span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>

            <!-- Schedule -->
            <v-card variant="outlined" class="mb-4" v-if="group.schedules && group.schedules.length > 0">
              <v-card-title class="text-h6 pa-4">{{ $t('groups.info.schedule') }}</v-card-title>
              <v-card-text>
                <div v-for="schedule in group.schedules" :key="schedule.id" class="schedule-item mb-2">
                  <v-chip size="small" class="me-2">{{ formatDayName(schedule.day) }}</v-chip>
                  <span class="text-body-1">{{ formatTime(schedule.startTime) }}</span>
                </div>
              </v-card-text>
            </v-card>

            <!-- Summary -->
            <v-card variant="outlined">
              <v-card-title class="text-h6 pa-4">{{ $t('groups.info.summary') }}</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.totalStudents') }}</span>
                      <span class="info-value">{{ students.length }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.lessonsPerWeek') }}</span>
                      <span class="info-value">{{ group.schedules?.length || 0 }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">{{ $t('groups.info.startDate') }}</span>
                      <span class="info-value">{{
                        group.startDate ? formatDate(group.startDate) : '—'
                      }}</span>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-card-text>
        </v-window-item>
      </v-window>
    </v-card>

    <!-- Attendance Quick Actions -->
    <v-menu
      v-model="attendanceDialog.show"
      :activator="attendanceDialog.activator"
      :open-on-click="false"
      :close-on-content-click="false"
      location="bottom"
      offset="6"
    >
      <v-card class="pa-3 attendance-status-card" elevation="4">
        <div class="text-caption text-medium-emphasis mb-2">
          {{ $t('groups.attendance.selectStatus') }}
        </div>
        <div class="attendance-status-options mb-3">
          <v-btn
            v-for="opt in statusOptions"
            :key="opt.value"
            :color="opt.color"
            :variant="attendanceForm.status === opt.value ? 'flat' : 'tonal'"
            size="small"
            class="status-option-btn"
            @click="attendanceForm.status = opt.value"
          >
            <v-icon :icon="opt.icon" size="18" start></v-icon>
            {{ opt.label }}
          </v-btn>
        </div>

        <v-textarea
          v-model="attendanceForm.comment"
          :label="$t('groups.attendance.comment')"
          :placeholder="
            attendanceForm.status === 'excused'
              ? $t('groups.attendance.commentRequiredHint')
              : ''
          "
          :error-messages="commentError"
          density="compact"
          variant="outlined"
          rows="2"
          auto-grow
          hide-details="auto"
          class="mb-3 attendance-comment"
        ></v-textarea>

        <div class="d-flex justify-end" style="gap: 8px">
          <v-btn size="small" variant="text" @click="attendanceDialog.show = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            size="small"
            color="primary"
            variant="flat"
            :loading="submittingAttendance"
            :disabled="!canSubmitAttendance"
            @click="saveAttendance"
          >
            {{ $t('common.save') }}
          </v-btn>
        </div>
      </v-card>
    </v-menu>

    <!-- Reschedule Dialog -->
    <v-dialog v-model="rescheduleDialog.show" max-width="520">
      <v-card>
        <v-card-title class="text-h6 pa-4"> {{ $t('groups.reschedule.title') }} </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <div class="text-body-2 text-medium-emphasis mb-2">{{ $t('groups.reschedule.fromToday') }}</div>
            </v-col>
            <v-col cols="12" md="6">
              <v-date-input
                v-model="rescheduleDialog.toDate"
                :label="$t('groups.reschedule.toDate')"
                density="compact"
                variant="outlined"
                :allowed-dates="isAllowedRescheduleDate"
              ></v-date-input>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="rescheduleDialog.reason"
                :label="$t('groups.reschedule.reason')"
                density="compact"
                variant="outlined"
                rows="2"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            @click="submitReschedule"
            :loading="rescheduleDialog.loading"
            :disabled="!canSubmitReschedule"
          >
            {{ $t('common.save') }}
          </v-btn>
          <v-btn variant="text" @click="rescheduleDialog.show = false"> {{ $t('common.cancel') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { Student } from '@/types/students.types'
import type { Group } from '@/types/groups.types'
import type {
  LessonDatesResponse,
  AttendanceStatus,
  SubmitAttendancePayload,
} from '@/types/attendance.types'
import { fetchGroupById, fetchLessonDates, submitAttendance, rescheduleAttendance } from '@/services/pages/groups'
import { fetchStudents } from '@/services/pages/students'
import GroupPlanTab from '@/components/pages/group/GroupPlanTab.vue'
import { usePermissions } from '@/composables/usePermissions'
import { useNotificationStore } from '@/stores/notification'
import type { StudentsParams } from '@/types/students.types'
import { StudentStatus } from '@/types/students.enum'

// Component name for linting
defineOptions({
  name: 'GroupView',
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// Orqaga qaytish (tarix bo'lsa — orqaga, aks holda guruhlar ro'yxatiga)
const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/groups')
}
const { canManageAttendance, canManagePastAttendance, isReception, userId } = usePermissions()
const notify = useNotificationStore()

// Davomat status'lari uchun ko'rinish (ikon + rang)
const STATUS_ICONS: Record<AttendanceStatus, string> = {
  present: 'mdi-check-circle',
  absent: 'mdi-close-circle',
  late: 'mdi-clock-alert',
  excused: 'mdi-account-clock',
}
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: 'success',
  absent: 'error',
  late: 'warning',
  excused: 'info',
}
const statusOptions = computed<{ value: AttendanceStatus; label: string; icon: string; color: string }[]>(
  () => [
    { value: 'present', label: t('groups.attendance.status.present'), icon: STATUS_ICONS.present, color: STATUS_COLORS.present },
    { value: 'absent', label: t('groups.attendance.status.absent'), icon: STATUS_ICONS.absent, color: STATUS_COLORS.absent },
    { value: 'late', label: t('groups.attendance.status.late'), icon: STATUS_ICONS.late, color: STATUS_COLORS.late },
    { value: 'excused', label: t('groups.attendance.status.excused'), icon: STATUS_ICONS.excused, color: STATUS_COLORS.excused },
  ],
)

// Tabs — reception davomatni ko'ra olmaydi, shuning uchun boshqa tabdan boshlaymiz
const activeTab = ref(canManageAttendance.value ? 'attendance' : 'students')
const planTabVisited = ref(false)
const groupId = computed(() => {
  const id = route.params.id
  return !id || Array.isArray(id) ? null : id
})
// Joriy foydalanuvchi shu guruhning o'qituvchisimi
const isOwnGroup = computed(() => !!group.value?.teacher && group.value.teacher.id === userId.value)

// Group data
const group = ref<Group | null>(null)
const loadingGroup = ref(false)

// Students data
const students = ref<Student[]>([])
const loadingStudents = ref(false)

// Attendance data
const attendanceData = ref<LessonDatesResponse | null>(null)
const loadingAttendance = ref(false)
const lessonDates = computed(() => attendanceData.value?.lessonDates || [])
const today = computed(() => attendanceData.value?.today || '')
const overridesByDate = computed(() => attendanceData.value?.overridesByDate || {})

// Month filter (year + month). Davomat doim to'liq bir oy ko'rinishida bo'ladi.
const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1) // 1-12

// Oy nomlari (locale'dan)
const monthOptions = computed(() =>
  Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: t(`groups.attendance.months.${i}`),
  })),
)

// Yil ro'yxati: joriy yildan 3 yil orqaga
const yearOptions = computed(() => {
  const current = new Date().getFullYear()
  return Array.from({ length: 4 }, (_, i) => current - i)
})

// Tanlangan oyning boshi va oxiri (YYYY-MM-DD)
const monthRange = computed(() => {
  const y = selectedYear.value
  const m = selectedMonth.value
  const mm = String(m).padStart(2, '0')
  const lastDay = new Date(y, m, 0).getDate() // keyingi oyning 0-kuni = shu oyning oxirgi kuni
  return {
    from: `${y}-${mm}-01`,
    to: `${y}-${mm}-${String(lastDay).padStart(2, '0')}`,
  }
})

// Joriy oyga qaytish
const goToCurrentMonth = () => {
  const d = new Date()
  selectedYear.value = d.getFullYear()
  selectedMonth.value = d.getMonth() + 1
}

// Reschedule dialog
const rescheduleDialog = ref({
  show: false,
  toDate: '',
  reason: '',
  loading: false,
})
const canSubmitReschedule = computed(() => {
  const toDate = formatDateForAPI(rescheduleDialog.value.toDate)
  return Boolean(toDate && !rescheduleDialog.value.loading)
})

// Attendance dialog
const attendanceDialog = ref({
  show: false,
  studentId: 0,
  lessonDate: '',
  activator: null as HTMLElement | null,
})

// Tanlangan katak uchun status + izoh formasi
const attendanceForm = ref<{ status: AttendanceStatus; comment: string }>({
  status: 'present',
  comment: '',
})

// "excused" (sababli) tanlanganda izoh (sabab) majburiy
const commentError = computed<string[]>(() => {
  if (attendanceForm.value.status === 'excused' && !attendanceForm.value.comment.trim()) {
    return [t('groups.attendance.commentRequired')]
  }
  return []
})
const canSubmitAttendance = computed(
  () => commentError.value.length === 0 && !submittingAttendance.value,
)

const submittingAttendance = ref(false)

// Berilgan o'quvchi/sanadagi mavjud davomat qatorini topish
const getStudentAttendance = (
  studentId: number,
  date: string,
): { status: AttendanceStatus; comment?: string } | undefined => {
  const attendance = attendanceData.value?.attendanceByDate[date]
  if (!attendance?.exists) return undefined
  const rows = attendance.rows ?? attendance.items ?? []
  return rows.find((r: { studentId: number }) => r.studentId === studentId)
}

// Load group data
const loadGroup = async () => {
  const groupId = route.params.id
  if (!groupId || Array.isArray(groupId)) return

  loadingGroup.value = true
  try {
    const response = await fetchGroupById(groupId)
    group.value = response.data
  } catch (error) {
    console.error('Failed to load group:', error)
  } finally {
    loadingGroup.value = false
  }
}

// Load students
const loadStudents = async () => {
  const groupId = route.params.id
  if (!groupId || Array.isArray(groupId)) return

  loadingStudents.value = true
  try {
    const params: StudentsParams = {
      groupId: Number(groupId),
      page: 1,
      perPage: 1000,
    }
    const response = await fetchStudents(params)
    students.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load students:', error)
  } finally {
    loadingStudents.value = false
  }
}

// Format date to YYYY-MM-DD
const formatDateForAPI = (date: string | Date | null | undefined): string | undefined => {
  if (!date) return undefined
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return undefined
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Load attendance data — doim tanlangan oyning to'liq oralig'i (boshidan oxirigacha).
// Kelajakdagi (hali o'tilmagan) darslar ham ko'rinadi, lekin ular tahrirlanmaydi.
const loadAttendance = async () => {
  const groupId = route.params.id
  if (!groupId || Array.isArray(groupId)) return

  loadingAttendance.value = true
  try {
    const { from, to } = monthRange.value
    const data = await fetchLessonDates(Number(groupId), { mode: 'range', from, to })
    attendanceData.value = data
  } catch (error) {
    console.error('Failed to load attendance:', error)
  } finally {
    loadingAttendance.value = false
  }
}

// Katakni tahrirlash mumkinmi: kelajak va bekor qilingan darslar hech qachon,
// bugun — har doim, o'tgan sanalar — faqat admin/o'qituvchi uchun.
const canEditCell = (date: string): boolean => {
  if (isFuture(date) || isCancelledDate(date)) return false
  if (isToday(date)) return true
  if (isPast(date)) return canManagePastAttendance.value
  return false
}

// Cell click handler
const handleCellClick = async (event: MouseEvent, studentId: number, lessonDate: string) => {
  if (!canEditCell(lessonDate)) return

  const sameTarget =
    attendanceDialog.value.studentId === studentId &&
    attendanceDialog.value.lessonDate === lessonDate

  if (attendanceDialog.value.show && sameTarget) {
    attendanceDialog.value.show = false
    await nextTick()
  }

  // Formani mavjud davomat bilan to'ldiramiz (yo'q bo'lsa — default "present")
  const existing = getStudentAttendance(studentId, lessonDate)
  attendanceForm.value = {
    status: existing?.status ?? 'present',
    comment: existing?.comment ?? '',
  }

  attendanceDialog.value = {
    show: true,
    studentId,
    lessonDate,
    activator: event.currentTarget as HTMLElement,
  }
}

// Save attendance (status + comment) for the selected student/date
const saveAttendance = async () => {
  // Frontend validatsiya: excused bo'lsa sabab majburiy — backend 400'ini oldini olamiz
  if (commentError.value.length > 0) {
    notify.error(commentError.value[0])
    return
  }

  const { studentId, lessonDate } = attendanceDialog.value
  const status = attendanceForm.value.status
  const comment = attendanceForm.value.comment.trim()

  submittingAttendance.value = true
  try {
    // Build minimal payload manually - ONLY the clicked student
    const payload: SubmitAttendancePayload = {
      lessonDate: lessonDate,
      items: [
        {
          studentId: studentId,
          status: status,
          ...(comment ? { comment } : {}),
        },
      ],
    }

    // Submit to API
    const groupId = route.params.id
    if (!groupId || Array.isArray(groupId)) return

    await submitAttendance(Number(groupId), payload)

    // Update local state optimistically
    if (attendanceData.value) {
      if (!attendanceData.value.attendanceByDate[lessonDate]) {
        attendanceData.value.attendanceByDate[lessonDate] = {
          exists: true,
          rows: [],
        }
      }

      // Get existing rows and update only the clicked student
      const existingRows =
        attendanceData.value.attendanceByDate[lessonDate].rows ??
        attendanceData.value.attendanceByDate[lessonDate].items ??
        []

      // Remove existing entry for this student if any
      const otherRows = existingRows.filter(
        (item: { studentId: number }) => item.studentId !== studentId,
      )

      // Add the new/updated entry
      const updatedRows = [
        ...otherRows,
        {
          studentId: studentId,
          status: status,
          comment: comment,
        },
      ]

      attendanceData.value.attendanceByDate[lessonDate].exists = true
      attendanceData.value.attendanceByDate[lessonDate].rows = updatedRows
    }

    attendanceDialog.value.show = false
    notify.success(t('groups.attendance.saved'))
    // Status o'zgargach backend to'lovni qayta hisoblaydi. To'lovlar alohida
    // sahifada bo'lgani uchun bu yerda ko'rsatiladigan narsa yo'q; davomatni
    // backenddan qayta o'qib, avtoritativ holatga keltiramiz.
    await loadAttendance()
  } catch (error: unknown) {
    // Backend 400 (masalan sababsiz excused) xabarini foydalanuvchiga ko'rsatamiz
    const err = error as { response?: { data?: { message?: string } } }
    notify.error(err?.response?.data?.message || t('groups.attendance.submitError'))
    console.error('Failed to submit attendance:', error)
  } finally {
    submittingAttendance.value = false
  }
}

// Get cell icon
const getCellIcon = (studentId: number, date: string): string => {
  if (isCancelledDate(date)) return 'mdi-cancel'
  if (isFuture(date)) return 'mdi-circle-outline'

  const attendance = attendanceData.value?.attendanceByDate[date]
  if (!attendance?.exists) return 'mdi-help-circle-outline'

  const rows = attendance.rows ?? attendance.items ?? []
  const item = rows.find((r: { studentId: number }) => r.studentId === studentId)
  if (!item) return 'mdi-help-circle-outline'

  return STATUS_ICONS[item.status] ?? 'mdi-help-circle-outline'
}

// Get cell icon color
const getCellIconColor = (studentId: number, date: string): string => {
  if (isCancelledDate(date)) return 'grey'
  // Future dates: grey
  if (isFuture(date)) return 'grey'

  // Check attendance status (for both past and today)
  const attendance = attendanceData.value?.attendanceByDate[date]
  if (!attendance?.exists) return 'grey'

  const rows = attendance.rows ?? attendance.items ?? []
  const item = rows.find((r: { studentId: number }) => r.studentId === studentId)
  if (!item) return 'grey'

  // Return actual colors - CSS will handle visual distinction for past dates
  return STATUS_COLORS[item.status] ?? 'grey'
}

// Katak uchun izoh (mavjud bo'lsa) — hover'da ko'rsatish uchun
const getCellComment = (studentId: number, date: string): string => {
  return getStudentAttendance(studentId, date)?.comment?.trim() || ''
}

// Check if date is past
const isPast = (date: string): boolean => {
  if (!today.value) return false
  return date < today.value
}

// Check if date is today
const isToday = (date: string): boolean => {
  return date === today.value
}

// Check if date is future
const isFuture = (date: string): boolean => {
  if (!today.value) return false
  return date > today.value
}

const getOverrideType = (date: string): 'cancelled' | 'extra' | undefined => {
  return overridesByDate.value?.[date]?.type
}

const isCancelledDate = (date: string): boolean => {
  return getOverrideType(date) === 'cancelled'
}

const isExtraDate = (date: string): boolean => {
  return getOverrideType(date) === 'extra'
}

const getOverrideLabel = (date: string): string => {
  const type = getOverrideType(date)
  if (type === 'cancelled') return t('groups.override.cancelled')
  if (type === 'extra') return t('groups.override.extra')
  return ''
}

const hasAttendanceForDate = (date: string): boolean => {
  const attendance = attendanceData.value?.attendanceByDate?.[date]
  return Boolean(attendance?.exists)
}

const canRescheduleDate = (date: string): boolean => {
  return (
    isToday(date) &&
    lessonDates.value.includes(date) &&
    !isCancelledDate(date) &&
    !hasAttendanceForDate(date)
  )
}

const openReschedule = (date: string) => {
  if (!canRescheduleDate(date)) return
  rescheduleDialog.value.show = true
}

const isAllowedRescheduleDate = (date: string): boolean => {
  const formatted = formatDateForAPI(date)
  if (!formatted || !today.value) return false
  if (formatted <= today.value) return false
  return !lessonDates.value.includes(formatted)
}

// Format date header
const formatDateHeader = (date: string): string => {
  const d = new Date(date)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  return `${day} ${month}`
}

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format day name
const formatDayName = (day: string): string => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

// Format time
const formatTime = (time: string): string => {
  if (!time) return '—'
  // Assuming time is in HH:mm format
  return time
}

// Get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case StudentStatus.ACTIVE:
      return 'success'
    case StudentStatus.STOPPED:
      return 'warning'
    case StudentStatus.FINISHED:
      return 'info'
    default:
      return 'grey'
  }
}

// Get group status color
const getGroupStatusColor = (status: string | undefined): string => {
  if (!status) return 'success'
  const lower = status.toLowerCase()
  if (lower === 'active') return 'success'
  if (lower === 'inactive') return 'warning'
  if (lower === 'archived') return 'grey'
  return 'primary'
}

const submitReschedule = async () => {
  const groupId = route.params.id
  if (!groupId || Array.isArray(groupId)) return

  const toDate = formatDateForAPI(rescheduleDialog.value.toDate)
  if (!toDate) return

  rescheduleDialog.value.loading = true
  try {
    await rescheduleAttendance(Number(groupId), {
      toDate,
      reason: rescheduleDialog.value.reason?.trim() || undefined,
    })

    rescheduleDialog.value.show = false
    rescheduleDialog.value.toDate = ''
    rescheduleDialog.value.reason = ''

    await loadAttendance()
  } catch (error) {
    console.error('Failed to reschedule attendance:', error)
  } finally {
    rescheduleDialog.value.loading = false
  }
}


// Student table headers
const studentHeaders = computed(() => [
  { title: t('groups.studentTable.fullName'), key: 'fullName' },
  { title: t('groups.studentTable.phone'), key: 'phone' },
  { title: t('common.status'), key: 'status' },
])

// Oy yoki yil o'zgarsa davomatni qayta yuklaymiz
watch([selectedYear, selectedMonth], () => {
  loadAttendance()
})

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
  if (newTab === 'plan') {
    planTabVisited.value = true
  }
  if (newTab === 'attendance' && !attendanceData.value) {
    loadAttendance()
  } else if (newTab === 'students' && students.value.length === 0) {
    loadStudents()
  } else if (newTab === 'info' && !group.value) {
    loadGroup()
  }
})

// Initialize
onMounted(() => {
  loadGroup()
  loadStudents()
  loadAttendance()
})
</script>

<style scoped>
/* Mobil ekranda ortiqcha padding'ni kamaytiramiz */
@media (max-width: 600px) {
  .group-view :deep(.v-card-text) {
    padding: 12px;
  }
  .group-view :deep(.v-window-item) .v-card-text {
    padding: 12px;
  }
}

.attendance-matrix {
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.attendance-table-wrapper {
  overflow-x: auto;
  min-width: 100%;
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.attendance-table thead {
  background-color: rgba(0, 0, 0, 0.05);
}

.attendance-table th,
.attendance-table td {
  padding: 12px;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.student-column {
  min-width: 200px;
  max-width: 200px;
  text-align: left !important;
  background-color: white;
  font-weight: 500;
}

.student-column.sticky {
  position: sticky;
  left: 0;
  z-index: 10;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.date-column {
  min-width: 100px;
  background-color: white;
}

.today-column {
  background-color: rgba(25, 118, 210, 0.1);
}

.attendance-cell {
  cursor: default;
  transition: background-color 0.2s, opacity 0.2s;
}

/* Today - fully interactive */
.attendance-cell.cell-today {
  cursor: pointer;
  opacity: 1;
}

.attendance-cell.cell-today:hover {
  background-color: rgba(25, 118, 210, 0.1);
}

/* Past dates - read-only, visually distinct but colors visible */
.attendance-cell.cell-past {
  opacity: 0.75;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.02);
}

.attendance-cell.cell-past:hover {
  background-color: rgba(0, 0, 0, 0.02);
  cursor: not-allowed;
}

.attendance-cell.cell-past .icon-past {
  filter: grayscale(20%);
  opacity: 0.9;
}

/* Past dates that the current user may still edit (admin / teacher) */
.attendance-cell.cell-past.cell-editable {
  opacity: 1;
  cursor: pointer;
  background-color: transparent;
}

.attendance-cell.cell-past.cell-editable:hover {
  background-color: rgba(25, 118, 210, 0.1);
  cursor: pointer;
}

.attendance-cell.cell-past.cell-editable .icon-past {
  filter: none;
  opacity: 1;
}

/* Future dates - disabled, slightly different from past */
.attendance-cell.cell-future {
  opacity: 0.35;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.01);
  border: 1px dashed rgba(0, 0, 0, 0.15) !important;
}

.attendance-cell.cell-future:hover {
  background-color: rgba(0, 0, 0, 0.01);
  cursor: not-allowed;
}

.attendance-cell.cell-future .icon-future {
  filter: grayscale(100%);
  opacity: 0.5;
}

.attendance-cell.cell-cancelled {
  opacity: 0.35;
  cursor: not-allowed;
  background-color: rgba(0, 0, 0, 0.03);
}

.attendance-cell.cell-cancelled:hover {
  background-color: rgba(0, 0, 0, 0.03);
  cursor: not-allowed;
}

.override-label {
  margin-top: 4px;
  font-size: 0.75rem;
  line-height: 1;
}

.override-label.cancelled {
  color: rgba(0, 0, 0, 0.5);
}

.override-label.extra {
  color: rgba(1, 192, 200, 0.9);
}

.cell-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 32px;
}

.attendance-status-card {
  min-width: 280px;
  max-width: 320px;
}

.attendance-status-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.status-option-btn {
  justify-content: flex-start;
  text-transform: none;
}

.cell-content {
  position: relative;
}

.comment-dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(1, 192, 200);
}

.student-name {
  font-weight: 500;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.info-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.info-value {
  color: rgba(0, 0, 0, 0.87);
  font-size: 1rem;
}

.schedule-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.status-chip {
  display: inline-flex;
  align-self: flex-start;
}
</style>
