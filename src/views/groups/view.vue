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
              <v-col cols="12" md="4" class="d-flex">
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
                        }"
                        @click="handleCellClick(student.id, date)"
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

    <!-- Attendance Confirmation Dialog -->
    <v-dialog v-model="attendanceDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> Mark Attendance </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-4">
            Is <strong>{{ getStudentName(attendanceDialog.studentId) }}</strong> present?
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="success"
            variant="flat"
            @click="markAttendance('present')"
            :loading="submittingAttendance"
          >
            Present
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="markAttendance('absent')"
            :loading="submittingAttendance"
          >
            Absent
          </v-btn>
          <v-btn variant="text" @click="attendanceDialog.show = false"> Cancel </v-btn>
        </v-card-actions>
  </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Student } from '@/types/students.types'
import type { Group } from '@/types/groups.types'
import type {
  LessonDatesResponse,
  AttendanceStatus,
  SubmitAttendancePayload,
} from '@/types/attendance.types'
import { fetchGroupById, fetchLessonDates, submitAttendance } from '@/services/pages/groups'
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

// Date filters
const dateFrom = ref('')
const dateTo = ref('')

// Attendance dialog
const attendanceDialog = ref({
  show: false,
  studentId: 0,
  lessonDate: '',
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
const handleCellClick = (studentId: number, lessonDate: string) => {
  if (!isToday(lessonDate) || isFuture(lessonDate)) return

  attendanceDialog.value = {
    show: true,
    studentId,
    lessonDate,
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

// Get student name
const getStudentName = (studentId: number): string => {
  const student = students.value.find((s) => s.id === studentId)
  return student ? `${student.firstName} ${student.lastName}` : 'Student'
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

.cell-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 32px;
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
