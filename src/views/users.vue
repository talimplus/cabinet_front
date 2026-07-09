<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"
      >{{ $t('users.title') }}
      <v-btn color="primary" @click="openModal = true">{{ $t('common.create') }}</v-btn>
    </v-card-title>
    <v-row class="px-4">
      <v-col cols="3">
        <v-select
          :label="$t('users.filter.center')"
          variant="outlined"
          clearable
          density="compact"
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
          density="compact"
          v-model="params.name"
          :label="$t('users.filter.fullName')"
        ></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field
          @input="getUsers"
          density="compact"
          variant="outlined"
          v-model="params.phone"
          :label="$t('users.filter.phone')"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-card-text>
      <v-data-table :loading="laoding" :items="users" :headers="headers" hide-default-footer>
      <template #item.role="{ item }">
        {{ roleLabel(item.role) }}
      </template>
      <template #item.commissionPercentage="{ item }">
        <div v-if="item?.commissionPercentage">{{ item.commissionPercentage }}%</div>
      </template>
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
      <v-pagination v-model="params.page" :length="totalPages" class="mt-4"></v-pagination>
    </v-card-text>
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
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchUsers, deleteUser } from '@/services/pages/users'
import type { User, UsersParams } from '@/types/users.types'
import CreateUser from '../components/pages/user/CreateUser.vue'
import type { Center } from '@/types/centers.types'
import { fetchAllCenters } from '@/services/pages/centers'

const { t } = useI18n()

function roleLabel(role: string) {
  return role ? t(`users.roles.${role}`) : ''
}

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

const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !params.value.centerId) {
      const defaultCenter = centers.value.find((c) => c.isDefault) || centers.value[0]
      params.value.centerId = defaultCenter.id
    }
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  await getCenters()
  if (params.value.centerId) {
    await getUsers()
  }
})

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
  },
)

const headers = computed(() => [
  { title: t('users.table.id'), key: 'id' },
  { title: t('users.table.firstName'), key: 'firstName' },
  { title: t('users.table.lastName'), key: 'lastName' },
  { title: t('common.phone'), key: 'phone' },
  { title: t('users.table.role'), key: 'role' },
  { title: t('users.table.salary'), key: 'salary' },
  { title: t('users.table.commissionPercentage'), key: 'commissionPercentage' },
  { title: t('users.table.center'), key: 'center.name' },
  { title: t('common.actions'), key: 'actions' },
])
</script>

<style scoped></style>
