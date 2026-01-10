<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"> O'quvchilar </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="params.centerId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            label="Markaz"
            clearable
            variant="outlined"
            density="compact"
            :loading="loadingCenters"
            @update:model-value="getStudents"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-data-table :items="students" :headers="headers" hide-default-footer>
      <template v-slot:item.birthDate="{ item }">
        {{ formatDate(item.birthDate) }}
      </template>
      <template v-slot:item.monthlyFee="{ item }">
        {{ formatCurrency(item.monthlyFee) }}
      </template>
      <template v-slot:item.discountPercent="{ item }">
        <div v-if="item.discountPeriods && item.discountPeriods.length > 0">
          <div v-for="(period, index) in item.discountPeriods" :key="index" class="mb-1">
            <span>{{ period.percent }}%</span>
            <span v-if="period.reason" class="text-caption text-medium-emphasis">
              -
              <v-tooltip v-if="period.reason.length > 20" location="top">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="discount-reason-text">
                    {{ truncateText(period.reason, 20) }}
                  </span>
                </template>
                <span>{{ period.reason }}</span>
              </v-tooltip>
              <span v-else>{{ period.reason }}</span>
            </span>
          </div>
        </div>
        <div v-else-if="item.discountPercent">
          {{ item.discountPercent }}%
          <span v-if="item.discountReason" class="text-caption text-medium-emphasis d-block">
            <v-tooltip v-if="item.discountReason.length > 20" location="top">
              <template v-slot:activator="{ props }">
                <span v-bind="props" class="discount-reason-text">
                  {{ truncateText(item.discountReason, 20) }}
                </span>
              </template>
              <span>{{ item.discountReason }}</span>
            </v-tooltip>
            <span v-else>{{ item.discountReason }}</span>
          </span>
        </div>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
      <template v-slot:item.status="{ item }">
        <div class="d-flex align-center gap-2">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="flat"
          >
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
    <CreateStudent
      @updateData="getStudents"
      v-model:open="openModal"
      :formForEdit="formForEdit"
      @clearForm="clearFormForEdit"
    ></CreateStudent>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { StudentsParams, Student } from '@/types/students.types'
import { fetchStudents, updateStudentStatus } from '@/services/pages/students'
import { StudentStatus, studentStatusLabels } from '@/types/students.enum'
import CreateStudent from '@/components/students/CreateStudent.vue'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/center.types'

const statusList = computed(() => {
  return [
    { title: studentStatusLabels[StudentStatus.STOPPED], value: StudentStatus.STOPPED },
    { title: studentStatusLabels[StudentStatus.FINISHED], value: StudentStatus.FINISHED },
  ]
})

const openModal = ref(false)
const students = ref<Student[]>([])
const formForEdit = ref<Student>({})
const centers = ref<Center[]>([])
const loadingCenters = ref(false)

const params = ref<StudentsParams>({
  centerId: undefined,
  name: '',
  phone: '',
  status: StudentStatus.ACTIVE,
  page: 1,
  perPage: 10,
  groupId: undefined,
})

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

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

const getStudents = async () => {
  if (!params.value.centerId) return
  try {
    const {
      data: { data },
    } = await fetchStudents(params.value)
    students.value = data
    students.value.map((student: Student) => {
      student.openStatus = false
      student.statusLoading = false
    })
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  await loadCenters()
  if (params.value.centerId) {
    await getStudents()
  }
})

const changeStatus = async (status: StudentStatus, item: Student) => {
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

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Ism', key: 'firstName' },
  { title: 'Familiya', key: 'lastName' },
  { title: 'Telefon', key: 'phone' },
  { title: 'Tug\'ilgan sana', key: 'birthDate' },
  { title: 'Oylik to\'lov', key: 'monthlyFee' },
  { title: 'Chegirma', key: 'discountPercent' },
  { title: 'Holat', key: 'status' },
  { title: 'Amallar', key: 'action' },
]

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
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
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
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
