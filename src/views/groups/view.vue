<template>
  <v-container fluid>
  <v-card>
      <v-card-title class="text-h5 pa-4">
        {{ group?.name || 'Group Details' }}
      </v-card-title>

      <v-tabs v-model="activeTab" bg-color="primary" slider-color="white">
        <v-tab value="attendance">Attendance</v-tab>
        <v-tab value="students">Students</v-tab>
        <v-tab value="info">Group Info</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <!-- TAB 1: ATTENDANCE -->
        <v-window-item value="attendance">
          <v-card-text>
            <!-- Date Range Filter -->
            <v-row class="mb-4">
              <v-col cols="12" md="4">
                <v-date-input
                  v-model="dateFrom"
                  label="From Date"
                  density="compact"
                  variant="outlined"
                  :max="today"
                  @update:model-value="loadAttendance"
                ></v-date-input>
              </v-col>
              <v-col cols="12" md="4">
                <v-date-input
                  v-model="dateTo"
                  label="To Date (optional)"
                  density="compact"
                  variant="outlined"
                  :max="today"
                  @update:model-value="loadAttendance"
                ></v-date-input>
              </v-col>
              <v-col cols="12" md="4" class="d-flex align-center" style="gap: 8px">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  @click="clearFilters"
                  prepend-icon="mdi-close-circle"
                >
                  Clear
                </v-btn>
              </v-col>
            </v-row>

            <!-- Attendance Matrix -->
            <div v-if="loadingAttendance" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="students.length === 0" class="text-center pa-8 text-medium-emphasis">
              No students in this group
            </div>

            <div v-else class="attendance-matrix">
              <div class="attendance-table-wrapper">
                <table class="attendance-table">
                  <thead>
                    <tr>
                      <th class="student-column sticky">Student</th>
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
                        }"
                        @click="handleCellClick($event, student.id, date)"
                      >
                        <div class="cell-content">
                          <v-icon
                            :color="getCellIconColor(student.id, date)"
                            :icon="getCellIcon(student.id, date)"
                            size="24"
                            :class="{
                              'icon-past': isPast(date),
                              'icon-future': isFuture(date),
                            }"
                          ></v-icon>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </v-card-text>
        </v-window-item>

        <!-- TAB 2: STUDENTS -->
        <v-window-item value="students">
          <v-card-text>
            <v-data-table
              :items="students"
              :headers="studentHeaders"
              :loading="loadingStudents"
              hide-default-footer
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
              <template v-slot:item.createdAt="{ item }">
                {{ item.createdAt ? formatDate(item.createdAt) : '—' }}
      </template>
    </v-data-table>
          </v-card-text>
        </v-window-item>

        <!-- TAB 3: GROUP INFO -->
        <v-window-item value="info">
          <v-card-text v-if="loadingGroup" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </v-card-text>

          <v-card-text v-else-if="group">
            <!-- Basic Info -->
            <v-card variant="outlined" class="mb-4">
              <v-card-title class="text-h6 pa-4">Basic Info</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Group Name:</span>
                      <span class="info-value">{{ group.name }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Center:</span>
                      <span class="info-value">{{ group.center?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Subject:</span>
                      <span class="info-value">{{ group.subject?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Teacher:</span>
                      <span class="info-value">
                        {{
                          group.teacher
                            ? `${group.teacher.firstName} ${group.teacher.lastName}`
                            : 'Not assigned'
                        }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Room:</span>
                      <span class="info-value">{{ group.room?.name || '—' }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Status:</span>
                      <v-chip
                        class="status-chip"
                        :color="getGroupStatusColor(group.status)"
                        size="small"
                        variant="flat"
                      >
                        {{ group.status || 'Active' }}
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Duration (months):</span>
                      <span class="info-value">
                        {{ group.durationMonths ?? '—' }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="info-row">
                      <span class="info-label">Start Date:</span>
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
              <v-card-title class="text-h6 pa-4">Schedule</v-card-title>
              <v-card-text>
                <div v-for="schedule in group.schedules" :key="schedule.id" class="schedule-item mb-2">
                  <v-chip size="small" class="me-2">{{ formatDayName(schedule.day) }}</v-chip>
                  <span class="text-body-1">{{ formatTime(schedule.startTime) }}</span>
                </div>
              </v-card-text>
            </v-card>

            <!-- Summary -->
            <v-card variant="outlined">
              <v-card-title class="text-h6 pa-4">Summary</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">Total Students:</span>
                      <span class="info-value">{{ students.length }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">Lessons per Week:</span>
                      <span class="info-value">{{ group.schedules?.length || 0 }}</span>
                    </div>
                  </v-col>
                  <v-col cols="12" md="4">
                    <div class="info-row">
                      <span class="info-label">Start Date:</span>
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
      :close-on-content-click="false"
      location="bottom"
      offset="6"
    >
      <v-card class="pa-2" elevation="4">
        <div class="attendance-quick-actions">
          <v-btn
            color="success"
            variant="text"
            icon="mdi-check"
            @click="markAttendance('present')"
            :loading="submittingAttendance"
          ></v-btn>
          <v-btn
            color="error"
            variant="text"
            icon="mdi-close"
            @click="markAttendance('absent')"
            :loading="submittingAttendance"
          ></v-btn>
        </div>
      </v-card>
    </v-menu>

    <!-- Reschedule Dialog -->
    <v-dialog v-model="rescheduleDialog.show" max-width="520">
      <v-card>
        <v-card-title class="text-h6 pa-4"> Reschedule Lesson </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <div class="text-body-2 text-medium-emphasis mb-2">From: Bugun</div>
            </v-col>
            <v-col cols="12" md="6">
              <v-date-input
                v-model="rescheduleDialog.toDate"
                label="To Date"
                density="compact"
                variant="outlined"
                :allowed-dates="isAllowedRescheduleDate"
              ></v-date-input>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="rescheduleDialog.reason"
                label="Reason (optional)"
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
            Save
          </v-btn>
          <v-btn variant="text" @click="rescheduleDialog.show = false"> Cancel </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { Student } from '@/types/students.types'
import type { Group } from '@/types/groups.types'
import type {
  LessonDatesResponse,
  AttendanceStatus,
  SubmitAttendancePayload,
} from '@/types/attendance.types'
import { fetchGroupById, fetchLessonDates, submitAttendance, rescheduleAttendance } from '@/services/pages/groups'
import { fetchStudents } from '@/services/pages/students'
import type { StudentsParams } from '@/types/students.types'
import { StudentStatus } from '@/types/students.enum'

// Component name for linting
defineOptions({
  name: 'GroupView',
})

const route = useRoute()

// Tabs
const activeTab = ref('attendance')

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

// Date filters
const dateFrom = ref('')
const dateTo = ref('')

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

const submittingAttendance = ref(false)

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

// Clear date filters and reset to default
const clearFilters = () => {
  dateFrom.value = ''
  dateTo.value = ''
  loadAttendance()
}

// Load attendance data
const loadAttendance = async () => {
  const groupId = route.params.id
  if (!groupId || Array.isArray(groupId)) return

  loadingAttendance.value = true
  try {
    const params: { mode?: 'last' | 'range'; count?: number; from?: string; to?: string } = {}

    if (dateFrom.value || dateTo.value) {
      // At least one date selected - use range mode
      params.mode = 'range'
      params.from = formatDateForAPI(dateFrom.value)
      params.to = formatDateForAPI(dateTo.value)
    } else {
      // No dates selected - use last 7 days
      params.mode = 'last'
      params.count = 7
    }

    const data = await fetchLessonDates(Number(groupId), params)
    attendanceData.value = data
  } catch (error) {
    console.error('Failed to load attendance:', error)
  } finally {
    loadingAttendance.value = false
  }
}

// Cell click handler
const handleCellClick = async (event: MouseEvent, studentId: number, lessonDate: string) => {
  if (!isToday(lessonDate) || isFuture(lessonDate) || isCancelledDate(lessonDate)) return

  const sameTarget =
    attendanceDialog.value.studentId === studentId &&
    attendanceDialog.value.lessonDate === lessonDate

  if (attendanceDialog.value.show && sameTarget) {
    attendanceDialog.value.show = false
    await nextTick()
  }

  attendanceDialog.value = {
    show: true,
    studentId,
    lessonDate,
    activator: event.currentTarget as HTMLElement,
  }
}

// Mark attendance
const markAttendance = async (status: AttendanceStatus) => {
  const { studentId, lessonDate } = attendanceDialog.value

  submittingAttendance.value = true
  try {
    // Build minimal payload manually - ONLY the clicked student
    const payload: SubmitAttendancePayload = {
      lessonDate: lessonDate,
      items: [
        {
          studentId: studentId,
          status: status,
          comment: '',
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
          comment: '',
        },
      ]

      attendanceData.value.attendanceByDate[lessonDate].exists = true
      attendanceData.value.attendanceByDate[lessonDate].rows = updatedRows
    }

    attendanceDialog.value.show = false
  } catch (error) {
    console.error('Failed to submit attendance:', error)
    // Optionally show error message to user
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

  return item.status === 'present' ? 'mdi-check-circle' : 'mdi-close-circle'
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

  // Return actual colors (success/error) - CSS will handle visual distinction for past dates
  return item.status === 'present' ? 'success' : 'error'
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
  if (type === 'cancelled') return 'Bekor qilindi'
  if (type === 'extra') return "Ko'chirilgan dars"
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
const studentHeaders = [
  { title: 'Full Name', key: 'fullName' },
  { title: 'Phone', key: 'phone' },
  { title: 'Status', key: 'status' },
  { title: 'Created Date', key: 'createdAt' },
]

// Watch for tab changes to load data
watch(activeTab, (newTab) => {
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

.attendance-quick-actions {
  display: flex;
  align-items: center;
  gap: 4px;
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
