<template>
  <v-dialog width="800" v-model="dialog">
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
              <!-- <v-text-field v-model="form.birthDate" label="birthDate"></v-text-field> -->
              <v-date-input label="Date input"></v-date-input>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.login" label="login"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="students"
                item-title="name"
                v-model="form.referrerId"
                label="referrerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.monthlyFee" label="monthlyFee"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.password" label="password"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="centers"
                item-title="name"
                v-model="form.centerId"
                label="centerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="groups"
                item-title="name"
                v-model="form.groupIds"
                label="groupIds"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StudentForm } from '@/types/students.types'
import type { Center } from '@/types/center.types'
import { fetchCenters } from '@/services/pages/centers'
import { fetchGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchStudents } from '@/services/pages/students'
import type { Student } from '@/types/students.types'

const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const students = ref<Student[]>([])

const form = ref<StudentForm>({
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',
  login: '',
  referrerId: undefined,
  monthlyFee: undefined,
  password: '',
  centerId: undefined,
  groupIds: undefined,
})

const getCenters = async () => {
  try {
    const {
      data: { data },
    } = await fetchCenters()
    centers.value = data
  } catch (err) {
    console.log(err)
  }
}
getCenters()

const getGroups = async () => {
  try {
    const {
      data: { data },
    } = await fetchGroups()
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}
getGroups()

const getStudents = async () => {
  try {
    const {
      data: { data },
    } = await fetchStudents({ page: 1, perPage: 10, status: 'new' })
    students.value = data
  } catch (err) {
    console.log(err)
  }
}
getStudents()

const dialog = ref(true)
</script>