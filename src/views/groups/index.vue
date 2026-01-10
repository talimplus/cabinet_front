<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Groups
      <v-btn color="primary" @click="openFormModal = true">Create</v-btn>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="params.centerId"
            :items="centerOptions"
            item-title="title"
            item-value="value"
            label="Markaz"
            variant="outlined"
            density="compact"
            clearable
            :loading="loadingCenters"
            @update:model-value="getGroups"
          ></v-select>
        </v-col>
      </v-row>
    </v-card-text>
    <v-data-table :items="items" :headers="headers" hide-default-footer>
      <template v-slot:item.teacherFullName="{ item }">
        <div>{{ item.teacher.firstName + ' ' + item.teacher.lastName }}</div>
      </template>
      <template v-slot:item.schedules="{ item }">
        <div v-for="(day, i) in item.schedules" :key="`day-${i}`">
          {{ day.day }} - {{ day.startTime }}
        </div>
      </template>

      <template v-slot:item.monthlyFee="{ item }">
        {{ formatCurrency(item.monthlyFee) }}
      </template>

      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-btn
            @click="$router.push('/groups/' + item.id)"
            density="compact"
            color="medium-emphasis"
            icon="mdi-eye"
            size="small"
            class="me-2"
            variant="text"
          >
          </v-btn>
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            variant="text"
            @click="edit(item)"
          ></v-btn>
          <v-btn
            teicon="mdi-delete"
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
            :loading="deleteLoading"
            @click="remove(item.id)"
          >
          </v-btn>
        </div>
      </template>
    </v-data-table>
    <create-group-modal
      :centers="centers"
      v-model:open="openFormModal"
      @close="openFormModal = false"
      @updateData="getGroups"
      @clearEditForm="clearEditForm"
      :formForEdit="formForEdit"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchGroups, deleteGroup } from '@/services/pages/groups'
import CreateGroupModal from '@/components/pages/group/CreateGroupModal.vue'
import { fetchCenters, fetchAllCenters } from '@/services/pages/centers'
import { fetchSubjects } from '@/services/pages/subjects'
import { fetchUsers } from '@/services/pages/users'
import type { Group } from '@/types/groups.types'
import type { Center } from '@/types/centers.types'
import type { User } from '@/types/users.types'
import type { Subject } from '@/types/subject.types'
import type { GroupsParams } from '@/types/groups.types'

const items = ref<Group[]>([])
const centers = ref<Center[]>([])
const openFormModal = ref(false)
const subjects = ref<Subject[]>([])
const users = ref<User[]>([])
const deleteLoading = ref(false)
const formForEdit = ref<Group | null>(null)
const loadingCenters = ref(false)

const params = ref<GroupsParams>({
  centerId: undefined,
})

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

const edit = (room: Group) => {
  formForEdit.value = room
  openFormModal.value = true
}
const clearEditForm = () => {
  formForEdit.value = undefined
}

const getGroups = async () => {
  try {
    const {
      data: { data },
    } = await fetchGroups(params.value)
    items.value = data
    console.log(data)
  } catch (err) {
    console.log(err)
  }
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

onMounted(async () => {
  await loadCenters()
  if (params.value.centerId) {
    await getGroups()
  }
})

const getUsers = async () => {
  try {
    const {
      data: { data },
    } = await fetchUsers()
    users.value = data.map((item) => {
      item.fullName = item.firstName + ' ' + item.lastName
      return item
    })
  } catch (err) {
    console.log(err)
  }
}
getUsers()

const getSubjects = async () => {
  try {
    const {
      data: { data },
    } = await fetchSubjects()
    subjects.value = data
  } catch (err) {
    console.log(err)
  }
}
getSubjects()

const remove = async (id: number) => {
  try {
    deleteLoading.value = true
    await deleteGroup(id)
    getGroups()
  } catch (err) {
    console.log(err)
  } finally {
    deleteLoading.value = false
  }
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Nomi', key: 'name' },
  { title: 'Fan', key: 'subject.name' },
  { title: 'Dars vaqtlari', key: 'schedules' },
  { title: 'Kurs Summasi', key: 'monthlyFee' },
  { title: 'Xona', key: 'room.name' },
  { title: 'Ustoz', key: 'teacherFullName' },
  { title: 'Actions', key: 'actions' },
]

const formatCurrency = (amount: number | null): string => {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
}
</script>

<style scoped>
</style>