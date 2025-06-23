<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Reception
      <v-btn color="primary">Create</v-btn>
    </v-card-title>
    <v-data-table :items="students" :headers="headers" hide-default-footer> </v-data-table>
    <CreateStudent></CreateStudent>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StudentsParams, Student } from '@/types/students.types'
import { fetchStudents } from '@/services/pages/students'
import { StudentStatus } from '@/types/students.enum'
import CreateStudent from '../components/students/CreateStudent.vue'

const students = ref<Student[]>([])
const params = ref<StudentsParams>({
  centerId: undefined,
  name: '',
  phone: '',
  status: StudentStatus.NEW,
  page: 1,
  perPage: 10,
  groupId: undefined,
})

const getStudents = async () => {
  try {
    const {
      data: { data },
    } = await fetchStudents(params.value)
    students.value = data
  } catch (err) {
    console.log(err)
  }
}
getStudents()

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