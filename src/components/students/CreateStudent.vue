<template>
  <v-dialog width="800" v-model="open">
    <form @submit.prevent="submit">
      <v-card title="Create Student">
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="form.firstName" label="firstName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.lastName" label="lastName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.phone" label="phone"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-date-input
                label="Select a date"
                prepend-icon=""
                prepend-inner-icon="$calendar"
                v-model="form.birthDate"
              ></v-date-input>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="students"
                item-title="firstName"
                item-value="id"
                v-model="form.referrerId"
                label="referrerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.monthlyFee" label="monthlyFee"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="centers"
                item-title="name"
                item-value="id"
                v-model="form.centerId"
                label="centerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="groups"
                item-title="name"
                item-value="id"
                multiple
                v-model="form.groupIds"
                label="groupIds"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="open = false" text="Cancel"></v-btn>
          <v-btn color="primary" type="submit" :loading="loading" text="Save"></v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch } from 'vue'
import type { StudentForm } from '@/types/students.types'
import type { Center } from '@/types/center.types'
import { fetchAllCenters } from '@/services/pages/centers'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchAllStudents, createStudent, updateStudent } from '@/services/pages/students'
import type { Student } from '@/types/students.types'
import { StudentStatus } from '@/types/students.enum'
import dayjs from 'dayjs'

const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const students = ref<Student[]>([])
const open = defineModel('open')
const props = defineProps<Props>()
const loading = ref(false)

const form = ref<StudentForm>({
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',

  referrerId: undefined,
  monthlyFee: undefined,
  status: StudentStatus.NEW,
  centerId: undefined,
  groupIds: [],
})

interface Props {
  formForEdit?: Student
}
interface Emits {
  (e: 'updateData'): void
  (e: 'clearForm'): void
}
const emit = defineEmits<Emits>()
const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
  } catch (err) {
    console.log(err)
  }
}
getCenters()

watch(open, (newValue) => {
  if (newValue && props.formForEdit?.id) {
    ;(form.value.firstName = props.formForEdit.firstName),
      (form.value.lastName = props.formForEdit.lastName),
      (form.value.phone = props.formForEdit.phone),
      (form.value.birthDate = props.formForEdit.birthDate),
      (form.value.referrerId = props.formForEdit.referrerId),
      (form.value.monthlyFee = props.formForEdit.monthlyFee),
      (form.value.centerId = props.formForEdit.centerId),
      (form.value.groupIds = props.formForEdit.groupIds)
    console.log(props.formForEdit)
  }
  if (!newValue) {
    emit('clearForm')
    form.value = {
      firstName: '',
      lastName: '',
      phone: '',
      birthDate: '',
      referrerId: undefined,
      monthlyFee: undefined,
      centerId: undefined,
      groupIds: [],
    }
  }
})

const getGroups = async () => {
  try {
    const { data } = await fetchAllGroups()
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}
getGroups()

const getStudents = async () => {
  try {
    const { data } = await fetchAllStudents()
    students.value = data
  } catch (err) {
    console.log(err)
  }
}
getStudents()

const submit = async () => {
  loading.value = true
  form.value.monthlyFee = +form.value.monthlyFee
  form.value.birthDate = dayjs(form.value.birthDate).format('YYYY-MM-DD')
  try {
    if (props.formForEdit?.id) {
      delete form.value.status
      await updateStudent(form.value, props.formForEdit.id)
    } else {
      await createStudent(form.value)
    }
    open.value = false
    emit('updateData')
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>