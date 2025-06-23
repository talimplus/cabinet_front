<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"
      >Users
      <v-btn color="primary" @click="openModal = true">Create</v-btn>
    </v-card-title>
    <v-row class="px-4">
      <v-col cols="3">
        <v-select
          label="Centers"
          variant="outlined"
          clearable
          :items="centers"
          item-title="name"
          item-value="id"
          v-model="params.centerId"
          @update:modelValue="getUsers"
        ></v-select>
      </v-col>
      <v-col cols="3">
        <v-text-field
          @input="getUsers"
          variant="outlined"
          v-model="params.name"
          label="FullName"
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field
          @input="getUsers"
          variant="outlined"
          v-model="params.phone"
          label="Phone Number"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :loading="laoding" :items="users" :headers="headers" hide-default-footer>
      <template v-slot:item.actions="{ item }">
        <v-btn
          @click="editUser(item)"
          density="compact"
          color="medium-emphasis"
          icon="mdi-pencil"
          size="small"
          class="me-2"
          variant="text"
        ></v-btn>
        <v-btn
          @click="remove(item.id)"
          density="compact"
          color="medium-emphasis"
          icon="mdi-delete"
          size="small"
          variant="text"
        ></v-btn>
      </template>
    </v-data-table>
    <v-pagination v-model="params.page" :length="totalPages"></v-pagination>
    <CreateUser
      @updateData="getUsers"
      @clearForm="clearFormForEdit"
      v-model:open="openModal"
      :centers="centers"
      :formForEdit="formForEdit"
    ></CreateUser>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fetchUsers, deleteUser } from '@/services/pages/users'
import type { User, UsersParams } from '@/types/users.types'
import CreateUser from '../components/pages/user/CreateUser.vue'
import type { Center } from '@/types/center.types'
import { fetchCenters } from '@/services/pages/centers'

const centers = ref<Center[]>([])
const users = ref<User[]>([])
const openModal = ref(false)
const laoding = ref(false)
const formForEdit = ref<User>({})
const totalPages = ref(0)

const params = ref<UsersParams>({
  centerId: undefined,
  name: '',
  phone: '',
  page: 1,
  perPage: 10,
})

function editUser(item: User) {
  openModal.value = true
  formForEdit.value = item
}
const getUsers = async () => {
  laoding.value = true
  try {
    const {
      data: { data, meta },
    } = await fetchUsers(params.value)
    users.value = data
    totalPages.value = meta.totalPages
  } catch (err) {
    console.log(err)
  } finally {
    laoding.value = false
  }
}
getUsers()

const getCenters = async () => {
  try {
    const {
      data: { data },
    } = await fetchCenters()
    centers.value = data
    console.log(data)
  } catch (err) {
    console.log(err)
  }
}
getCenters()

const remove = async (id: number) => {
  try {
    await deleteUser(id)
    getUsers()
  } catch (err) {
    console.log(err)
  }
}

function clearFormForEdit() {
  formForEdit.value = {}
}

watch(
  () => params.value.page,
  () => {
    getUsers()
  }
)

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'FirstName', key: 'firstName' },
  { title: 'LastName', key: 'lastName' },
  { title: 'Phone', key: 'phone' },
  { title: 'Role', key: 'role' },
  { title: 'Salary', key: 'salary' },
  { title: 'ComissionPercentage', key: 'comissionPercentage' },
  { title: 'Center', key: 'center.name' },
  { title: 'Actions', key: 'actions' },
]
</script>

<style scoped>
</style>