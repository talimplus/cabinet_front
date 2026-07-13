<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      {{ $t('students.titles.reception') }}
      <v-btn @click="openModal = true" color="primary">{{ $t('students.actions.create') }}</v-btn>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="params.search"
            :label="$t('students.labels.search')"
            clearable
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            @update:model-value="onSearch"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="params.centerId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.labels.center')"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingCenters"
            @update:model-value="getStudents"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="params.subjectId"
            :items="subjectOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.labels.subject')"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingSubjects"
            @update:model-value="getStudents"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="params.preferredTime"
            :items="preferredTimeOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.labels.preferredTime')"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="getStudents"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-autocomplete
            v-model="params.preferredDays"
            :items="dayOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.labels.preferredDays')"
            multiple
            chips
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="getStudents"
          ></v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text>
      <v-data-table :items="students" :headers="headers" hide-default-footer>
      <template v-slot:item.monthlyFee="{ item }">
        {{ formatCurrency(item.monthlyFee) }}
      </template>
      <template v-slot:item.preferredTime="{ item }">
        {{ getPreferredTimeLabel(item.preferredTime) }}
      </template>
      <template v-slot:item.preferredDays="{ item }">
        <div v-if="item.preferredDays && item.preferredDays.length > 0" class="d-flex flex-wrap gap-1">
          <v-chip
            v-for="day in item.preferredDays"
            :key="day"
            size="small"
            variant="flat"
            color="primary"
          >
            {{ getDayLabel(day) }}
          </v-chip>
        </div>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
      <template v-slot:item.subject="{ item }">
        {{ item.subject?.name || '—' }}
      </template>
      <template v-slot:item.status="{ item }">
        <div class="d-flex align-center gap-2">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
            {{ getStatusLabel(item.status) }}
          </v-chip>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                @click="item.openStatus = true"
                density="compact"
                color="primary"
                icon="mdi-pencil"
                size="small"
                variant="text"
                :loading="item.statusLoading"
                v-bind="props"
              ></v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(status, index) in statusList"
                :key="index"
                :value="index"
                @click="changeStatus(status.value, item)"
              >
                <v-list-item-title>{{ status.title }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>
      <template v-slot:item.action="{ item }">
        <v-btn
          @click="editStudent(item)"
          density="compact"
          color="medium-emphasis"
          icon="mdi-pencil"
          size="small"
          class="me-2"
          variant="text"
        ></v-btn>
      </template>
      </v-data-table>
      <v-pagination
        v-model="params.page"
        :length="totalPages"
        class="mt-4"
        @update:model-value="getStudents"
      ></v-pagination>
    </v-card-text>
    <CreateStudent
      @updateData="getStudents"
      v-model:open="openModal"
      :formForEdit="formForEdit"
      @clearForm="clearFormForEdit"
    ></CreateStudent>
    <v-dialog v-model="returnDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4">{{ $t('students.dialog.returnTitle') }}</v-card-title>
        <v-card-text class="pa-4">
          <v-select
            v-model="returnDialog.value"
            :items="returnLikelihoodOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.labels.returnLikelihood')"
            variant="outlined"
            density="compact"
          ></v-select>
          <v-textarea
            v-model="returnDialog.comment"
            :label="$t('students.labels.comment')"
            rows="3"
            variant="outlined"
            density="compact"
            class="mt-3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeReturnDialog">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" @click="confirmReturnDialog" :loading="returnDialog.loading">
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top>
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> {{ $t('common.close') }} </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StudentsParams, Student } from '@/types/students.types'
import { fetchStudents, updateStudentStatus } from '@/services/pages/students'
import { StudentStatus, StudentPreferredTime, studentStatusLabels } from '@/types/students.enum'
import CreateStudent from '@/components/students/CreateStudent.vue'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/center.types'
import { WeekDay } from '@/types/groups.enum'
import { fetchAllSubjects } from '@/services/pages/subjects'
import type { Subject } from '@/types/subject.types'
import { useDebounceFn } from '@/composables/useDebounceFn'

const { t } = useI18n()

const statusList = computed(() => {
  return [
    { title: studentStatusLabels[StudentStatus.ACTIVE], value: StudentStatus.ACTIVE },
    { title: studentStatusLabels[StudentStatus.IGNORED], value: StudentStatus.IGNORED },
  ]
})

const openModal = ref(false)
const students = ref<Student[]>([])
const formForEdit = ref<Student>({})
const centers = ref<Center[]>([])
const subjects = ref<Subject[]>([])
const loadingCenters = ref(false)
const loadingSubjects = ref(false)
const totalPages = ref(1)
const snackbar = ref({
  show: false,
  message: '',
  color: 'error',
})

const params = ref<StudentsParams>({
  centerId: undefined,
  search: '',
  name: '',
  phone: '',
  status: StudentStatus.NEW,
  page: 1,
  perPage: 10,
  groupId: undefined,
  preferredTime: undefined,
  preferredDays: undefined,
  subjectId: undefined,
})

// Qidiruvda har bosishda emas, jimlikdan so'ng so'rov yuboramiz
const onSearch = useDebounceFn(() => {
  params.value.page = 1
  getStudents()
})

const centerOptions = computed(() => {
  return centers.value.map((center) => ({
    title: center.name,
    value: center.id,
  }))
})

const subjectOptions = computed(() => {
  return subjects.value.map((subject) => ({
    title: subject.name,
    value: subject.id,
  }))
})

const preferredTimeOptions = computed(() => [
  { title: t('students.time.morning'), value: StudentPreferredTime.MORNING },
  { title: t('students.time.evening'), value: StudentPreferredTime.EVENING },
])

const dayOptions = computed(() => [
  { title: t('students.days.monday'), value: WeekDay.MONDAY },
  { title: t('students.days.tuesday'), value: WeekDay.TUESDAY },
  { title: t('students.days.wednesday'), value: WeekDay.WEDNESDAY },
  { title: t('students.days.thursday'), value: WeekDay.THURSDAY },
  { title: t('students.days.friday'), value: WeekDay.FRIDAY },
  { title: t('students.days.saturday'), value: WeekDay.SATURDAY },
  { title: t('students.days.sunday'), value: WeekDay.SUNDAY },
])

function clearFormForEdit() {
  formForEdit.value = {}
}

function editStudent(item: Student) {
  openModal.value = true
  formForEdit.value = item
}

const loadCenters = async () => {
  loadingCenters.value = true
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !params.value.centerId) {
      const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
      params.value.centerId = defaultCenter.id
    }
  } catch (err) {
    console.log(err)
  } finally {
    loadingCenters.value = false
  }
}

const loadSubjects = async () => {
  loadingSubjects.value = true
  try {
    const { data } = await fetchAllSubjects()
    subjects.value = data
  } catch (err) {
    console.log(err)
  } finally {
    loadingSubjects.value = false
  }
}

const getStudents = async () => {
  if (!params.value.centerId) return
  try {
    const {
      data: { data, meta },
    } = await fetchStudents(params.value)
    students.value = data
    students.value.map((student: Student) => {
      student.openStatus = false
      student.statusLoading = false
    })
    totalPages.value = meta?.totalPages || 1
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  await loadCenters()
  await loadSubjects()
  if (params.value.centerId) {
    await getStudents()
  }
})

const changeStatus = async (status: StudentStatus, item: Student) => {
  const hasGroup = Array.isArray(item.groupIds)
    ? item.groupIds.length > 0
    : Array.isArray((item as any).groups)
      ? (item as any).groups.length > 0
      : !!(item as any).groupId

  if (status === StudentStatus.ACTIVE && !hasGroup) {
    snackbar.value = {
      show: true,
      message: t('students.messages.groupRequired'),
      color: 'error',
    }
    return
  }

  if (status === StudentStatus.STOPPED || status === StudentStatus.IGNORED) {
    returnDialog.value = {
      show: true,
      loading: false,
      value: undefined,
      comment: item.comment || '',
      status,
      studentId: item.id,
    }
    return
  }

  item.statusLoading = true
  try {
    await updateStudentStatus(status, item.id)
    await getStudents()
  } catch (err) {
    console.log(err)
  } finally {
    item.statusLoading = false
  }
}

const returnDialog = ref({
  show: false,
  loading: false,
  value: undefined as 'never' | 'maybe' | 'sure' | undefined,
  comment: '',
  status: undefined as StudentStatus | undefined,
  studentId: undefined as number | undefined,
})

const closeReturnDialog = () => {
  returnDialog.value = {
    show: false,
    loading: false,
    value: undefined,
    comment: '',
    status: undefined,
    studentId: undefined,
  }
}

const confirmReturnDialog = async () => {
  if (!returnDialog.value.value || !returnDialog.value.status || !returnDialog.value.studentId) {
    return
  }
  returnDialog.value.loading = true
  try {
    await updateStudentStatus(returnDialog.value.status, returnDialog.value.studentId, {
      returnLikelihood: returnDialog.value.value,
      comment: returnDialog.value.comment || undefined,
    })
    closeReturnDialog()
    await getStudents()
  } catch (err) {
    console.log(err)
  } finally {
    returnDialog.value.loading = false
  }
}

const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: t('students.labels.firstName'), key: 'firstName' },
  { title: t('students.labels.lastName'), key: 'lastName' },
  { title: t('common.phone'), key: 'phone' },
  { title: t('students.labels.subject'), key: 'subject' },
  { title: t('students.labels.monthlyFee'), key: 'monthlyFee' },
  { title: t('students.labels.preferredTime'), key: 'preferredTime' },
  { title: t('students.labels.preferredDays'), key: 'preferredDays' },
  { title: t('common.status'), key: 'status' },
  { title: t('common.actions'), key: 'action' },
])

const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    ' ' +
    t('students.currency')
  )
}

const truncateText = (text: string, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const getStatusLabel = (status: StudentStatus): string => {
  return studentStatusLabels[status] || status
}

const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case StudentStatus.NEW:
      return 'info'
    case StudentStatus.ACTIVE:
      return 'success'
    case StudentStatus.IGNORED:
      return 'warning'
    case StudentStatus.STOPPED:
      return 'error'
    case StudentStatus.FINISHED:
      return 'grey'
    default:
      return 'grey'
  }
}

const getPreferredTimeLabel = (time: string | null | undefined): string => {
  if (!time) return '—'
  switch (time) {
    case 'morning':
      return t('students.time.morning')
    case 'evening':
      return t('students.time.evening')
    default:
      return time
  }
}

const getDayLabel = (day: string): string => {
  const dayLabels: Record<string, string> = {
    monday: t('students.days.monday'),
    tuesday: t('students.days.tuesday'),
    wednesday: t('students.days.wednesday'),
    thursday: t('students.days.thursday'),
    friday: t('students.days.friday'),
    saturday: t('students.days.saturday'),
    sunday: t('students.days.sunday'),
  }
  return dayLabels[day.toLowerCase()] || day
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
