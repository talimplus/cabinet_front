<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between"
      >{{ $t('users.title') }}
      <v-btn v-if="can('users.create')" color="primary" @click="openModal = true">{{
        $t('common.create')
      }}</v-btn>
    </v-card-title>
    <v-row class="px-4">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          @input="getUsers"
          variant="outlined"
          density="compact"
          v-model="params.name"
          :label="$t('users.filter.fullName')"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="3">
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
        {{ roleLabel(item) }}
      </template>
      <template #item.commissionPercentage="{ item }">
        <div v-if="item?.commissionPercentage">{{ item.commissionPercentage }}%</div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          v-if="can('staffPerformance.view')"
          @click="openStaff(item)"
          density="compact"
          color="medium-emphasis"
          icon="mdi-eye"
          size="small"
          class="me-2"
          variant="text"
          :title="$t('staff.viewAction')"
        ></v-btn>
        <v-btn
          v-if="can('users.update')"
          @click="editUser(item)"
          density="compact"
          color="medium-emphasis"
          icon="mdi-pencil"
          size="small"
          class="me-2"
          variant="text"
        ></v-btn>
        <v-btn
          v-if="can('users.delete')"
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
      :formForEdit="formForEdit"
    ></CreateUser>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { fetchUsers, deleteUser } from '@/services/pages/users'
import type { User, UsersParams } from '@/types/users.types'
import CreateUser from '../components/pages/user/CreateUser.vue'
import { usePermissions } from '@/composables/usePermissions'

const { t } = useI18n()
const { can } = usePermissions()
const router = useRouter()

/** Xodim sahifasi: davomat, kechikishlar, topshirilmagan pullar, jarimalar */
const openStaff = (item: User) => {
  router.push(`/users/${item.id}`)
}

/**
 * Rol nomi endi dinamik — admin qo'ygan nom ("Kassir") ko'rsatiladi.
 * Rol biriktirilmagan eski yozuvlar uchun tur bo'yicha tarjimaga qaytamiz.
 */
function roleLabel(item: User) {
  if (item.userRole?.name) return item.userRole.name
  if (!item.role) return ''
  const key = `users.roles.${item.role}`
  const label = t(key)
  return label === key ? item.role : label
}

const users = ref<User[]>([])
const openModal = ref(false)
const laoding = ref(false)
const formForEdit = ref<User>({})
const totalPages = ref(0)

const params = ref<UsersParams>({
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

onMounted(async () => {
  await getUsers()
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
