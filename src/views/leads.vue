<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Leads
      <v-btn color="primary" @click="openModal = true">Yaratish</v-btn>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col v-if="isAdmin" cols="12" md="3">
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
            @update:model-value="handleCenterChange"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="params.status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            label="Status"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="getLeads"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select
            v-model="params.groupId"
            :items="groupOptions"
            item-title="title"
            item-value="value"
            label="Guruh"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="getLeads"
          ></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="params.name"
            label="Ism bo'yicha"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="getLeads"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field
            v-model="params.phone"
            label="Telefon"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="getLeads"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-text>
      <v-data-table :items="leads" :headers="headers" hide-default-footer>
        <template v-slot:item.fullName="{ item }">
          {{ `${item.firstName || ''} ${item.lastName || ''}`.trim() || '—' }}
        </template>
        <template v-slot:item.status="{ item }">
          <div class="d-flex align-center gap-2">
            <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
              {{ getStatusLabel(item.status) }}
            </v-chip>
            <v-menu v-if="getStatusOptions(item.status).length > 0">
              <template v-slot:activator="{ props }">
                <v-btn
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
                  v-for="(status, index) in getStatusOptions(item.status)"
                  :key="index"
                  @click="openDiscardDialog(item)"
                >
                  <v-list-item-title>{{ status.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <v-btn
              v-else
              density="compact"
              color="primary"
              icon="mdi-pencil"
              size="small"
              variant="text"
              disabled
            ></v-btn>
          </div>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            variant="text"
            @click="editLead(item)"
          ></v-btn>
        </template>
      </v-data-table>
      <v-pagination
        v-model="params.page"
        :length="totalPages"
        class="mt-4"
        @update:model-value="getLeads"
      ></v-pagination>
    </v-card-text>

    <CreateLeadModal
      v-model:open="openModal"
      :formForEdit="formForEdit"
      @clearForm="clearForm"
      @updateData="getLeads"
    />

    <v-dialog v-model="discardDialog.show" max-width="480">
      <v-card>
        <v-card-title class="text-h6 pa-4">Sabab</v-card-title>
        <v-card-text class="pa-4">
          <v-textarea
            v-model="discardDialog.reason"
            label="Sabab (ixtiyoriy)"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="discardDialog.show = false" :disabled="discardDialog.loading">
            Bekor qilish
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="discardDialog.loading"
            @click="confirmDiscard"
          >
            O'qishni xohlamadi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchLeads, changeLeadStatus } from '@/services/pages/leads'
import CreateLeadModal from '@/components/leads/CreateLeadModal.vue'
import type { Lead } from '@/types/leads.types'
import type { LeadsParams } from '@/types/leads.types'
import { LeadStatus } from '@/types/leads.enum'
import { fetchAllCenters } from '@/services/pages/centers'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Center } from '@/types/centers.types'
import type { Group } from '@/types/groups.types'
import { useUserStore } from '@/stores/user'

const leads = ref<Lead[]>([])
const openModal = ref(false)
const formForEdit = ref<Lead | null>(null)
const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const loadingCenters = ref(false)
const totalPages = ref(1)
const userStore = useUserStore()

const isAdmin = computed(() => userStore.user?.role === 'admin' || userStore.user?.role === 'super_admin')

const params = ref<LeadsParams>({
  centerId: undefined,
  name: '',
  phone: '',
  status: undefined,
  groupId: undefined,
  page: 1,
  perPage: 10,
})

const statusOptions = [
  { title: 'Yangi', value: LeadStatus.NEW },
  { title: 'Rad etilgan', value: LeadStatus.DISCARDED },
  { title: "Konvert bo'lgan", value: LeadStatus.CONVERTED },
]

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

const groupOptions = computed(() => {
  return groups.value.map(group => ({
    title: group.name,
    value: group.id,
  }))
})

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

const loadGroups = async (centerId?: number) => {
  try {
    const { data } = await fetchAllGroups(centerId)
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}

const getLeads = async () => {
  try {
    const { data } = await fetchLeads(params.value)
    const list = data?.data || data || []
    leads.value = list.map((item: Lead) => ({
      ...item,
      statusLoading: false,
    }))
    totalPages.value = data?.meta?.totalPages || 1
  } catch (err) {
    console.log(err)
  }
}

const handleCenterChange = () => {
  if (params.value.centerId) {
    loadGroups(params.value.centerId)
  } else {
    groups.value = []
    params.value.groupId = undefined
  }
  params.value.page = 1
  getLeads()
}

const editLead = (item: Lead) => {
  formForEdit.value = item
  openModal.value = true
}

const clearForm = () => {
  formForEdit.value = null
}

const getStatusLabel = (status?: LeadStatus): string => {
  const labels: Record<string, string> = {
    [LeadStatus.NEW]: 'Yangi',
    [LeadStatus.DISCARDED]: 'Rad etilgan',
    [LeadStatus.CONVERTED]: "Konvert bo'lgan",
  }
  if (!status) return '—'
  return labels[status] || status
}

const getStatusColor = (status?: LeadStatus): string => {
  switch (status) {
    case LeadStatus.NEW:
      return 'info'
    case LeadStatus.DISCARDED:
      return 'error'
    case LeadStatus.CONVERTED:
      return 'success'
    default:
      return 'grey'
  }
}

const getStatusOptions = (status?: LeadStatus) => {
  if (status === LeadStatus.NEW) {
    return [{ title: "O'qishni xohlamadi", value: LeadStatus.DISCARDED }]
  }
  return []
}

const discardDialog = ref({
  show: false,
  leadId: 0,
  reason: '',
  loading: false,
})

const openDiscardDialog = (lead: Lead) => {
  discardDialog.value = {
    show: true,
    leadId: lead.id,
    reason: '',
    loading: false,
  }
}

const confirmDiscard = async () => {
  discardDialog.value.loading = true
  try {
    await changeLeadStatus(discardDialog.value.leadId, LeadStatus.DISCARDED, discardDialog.value.reason || undefined)
    discardDialog.value.show = false
    await getLeads()
  } catch (err) {
    console.log(err)
  } finally {
    discardDialog.value.loading = false
  }
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Ism', key: 'fullName' },
  { title: 'Telefon', key: 'phone' },
  { title: 'Status', key: 'status' },
  { title: 'Amallar', key: 'actions' },
]

onMounted(async () => {
  await loadCenters()
  if (!isAdmin.value && userStore.user?.centerId) {
    params.value.centerId = userStore.user.centerId
  }
  if (params.value.centerId) {
    await loadGroups(params.value.centerId)
  }
  await getLeads()
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
