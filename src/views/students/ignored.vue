<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"> Rad etilganlar </v-card-title>
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
        <v-col cols="12" md="4">
          <v-select
            v-model="params.returnLikelihood"
            :items="returnLikelihoodOptions"
            item-title="title"
            item-value="value"
            label="Qaytish ehtimoli"
            clearable
            variant="outlined"
            density="compact"
            @update:model-value="getStudents"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-text>
      <v-data-table :items="students" :headers="headers" hide-default-footer>
      <template v-slot:item.birthDate="{ item }">
        {{ formatDate(item.birthDate) }}
      </template>
      <template v-slot:item.returnLikelihood="{ item }">
        {{ getReturnLikelihoodLabel(item.returnLikelihood) }}
      </template>
      <template v-slot:item.comment="{ item }">
        <v-tooltip v-if="item.comment && item.comment.length > 30" location="top">
          <template v-slot:activator="{ props }">
            <span v-bind="props">{{ truncateText(item.comment, 30) }}</span>
          </template>
          <span>{{ item.comment }}</span>
        </v-tooltip>
        <span v-else-if="item.comment">{{ item.comment }}</span>
        <span v-else class="text-medium-emphasis">—</span>
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
      </v-data-table>
    </v-card-text>
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
  return [{ title: studentStatusLabels[StudentStatus.NEW], value: StudentStatus.NEW }]
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
  status: StudentStatus.IGNORED,
  page: 1,
  perPage: 10,
  groupId: undefined,
  returnLikelihood: undefined,
})

const centerOptions = computed(() => {
  return centers.value.map((center) => ({
    title: center.name,
    value: center.id,
  }))
})

const returnLikelihoodOptions = [
  { title: 'Qaytmaydi', value: 'never' },
  { title: 'Balki', value: 'maybe' },
  { title: 'Albatta', value: 'sure' },
]

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
  { title: "Tug'ilgan sana", key: 'birthDate' },
  { title: 'Qaytish ehtimoli', key: 'returnLikelihood' },
  { title: 'Izoh', key: 'comment' },
  { title: 'Holat', key: 'status' },
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

const getReturnLikelihoodLabel = (value: string | null | undefined): string => {
  if (!value) return '—'
  switch (value) {
    case 'never':
      return 'Qaytmaydi'
    case 'maybe':
      return 'Balki'
    case 'sure':
      return 'Albatta'
    default:
      return value
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
