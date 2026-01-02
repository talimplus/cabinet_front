<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"> Students </v-card-title>
    <v-data-table :items="students" :headers="headers" hide-default-footer>
      <template v-slot:item.status="{ item }">
        <v-menu>
          <template v-slot:activator="{ props }">
            {{ item.status }}
            <v-btn
              @click="item.openStatus = true"
              density="compact"
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              class="me-2"
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { StudentsParams, Student } from '@/types/students.types'
import { fetchStudents, updateStudentStatus } from '@/services/pages/students'
import { StudentStatus, studentStatusLabels } from '@/types/students.enum'
import CreateStudent from '@/components/students/CreateStudent.vue'

const route = useRoute()

const statusList = computed(() => {
  return [
    { title: studentStatusLabels[StudentStatus.STOPPED], value: StudentStatus.STOPPED },
    { title: studentStatusLabels[StudentStatus.FINISHED], value: StudentStatus.FINISHED },
  ]
})

const openModal = ref(false)
const students = ref<Student[]>([])
const formForEdit = ref<Student>({})

const params = ref<StudentsParams>({
  centerId: undefined,
  name: '',
  phone: '',
  status: StudentStatus.ACTIVE,
  page: 1,
  perPage: 10,
  groupId: undefined,
})

function clearFormForEdit() {
  formForEdit.value = {}
}

function editStudent(item: Student) {
  openModal.value = true
  formForEdit.value = item
}

const getStudents = async () => {
  params.value.groupId = route.params.id
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
getStudents()

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
  { title: 'FirstName', key: 'firstName' },
  { title: 'LastName', key: 'lastName' },
  { title: 'Phone', key: 'phone' },
  { title: 'birthDate', key: 'phone' },
  { title: 'monthlyFee', key: 'monthlyFee' },
  { title: 'referralDiscount', key: 'referralDiscount' },
  { title: 'status', key: 'status' },
  { title: 'action', key: 'action' },
]
</script>