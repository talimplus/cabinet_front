<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      {{ $t('centers.title') }}
      <v-btn @click="dialog = true" color="primary">{{ $t('common.create') }}</v-btn>
    </v-card-title>
    <v-row class="px-4">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          @input="getCenters"
          v-model="params.name"
          density="compact"
          variant="outlined"
          :label="$t('centers.searchLabel')"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-card-text>
      <v-data-table :items="items" :headers="headers" hide-default-footer :loading="loading">
      <template v-slot:item.isDefault="{ item }">
        <v-icon v-if="item.isDefault" color="success" size="small">mdi-check-circle</v-icon>
        <span v-else class="text-medium-emphasis">—</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
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
            :loading="deleteLoading"
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
            @click="remove(item.id)"
          >
          </v-btn>
        </div>
      </template>
      </v-data-table>
      <v-pagination
        v-model="params.page"
        :length="totalPages"
        class="mt-4"
        @update:model-value="getCenters"
      ></v-pagination>
    </v-card-text>
    <CenterCreate
      ref="centerFormRef"
      :formForEdit="formForEdit"
      v-model:open="dialog"
      :test="test"
      @close="dialog = false"
      @updateData="getCenters"
      @clearEditForm="clearEditForm"
      @chaqiryapman="chaqirildi"
    ></CenterCreate>
  </v-card>
</template>

<script setup lang="ts">
import CenterCreate from '@/components/pages/center/CenterCreate.vue'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchCenters, deleteCenter } from '@/services/pages/centers'
import type { Center, CentersParams } from '@/types/center.types'

const { t } = useI18n()

const loading = ref(false)
const items = ref<Center[]>([])
const dialog = ref(false)
const formForEdit = ref<Center>()
const deleteLoading = ref(false)
const totalPages = ref(0)
const test = ref({ name: 'Lazizbek' })
const centerFormRef = ref()

const params = ref<CentersParams>({
  name: '',
  page: 1,
  perPage: 10,
})

const edit = (center: Center) => {
  formForEdit.value = center
  dialog.value = true
}

const clearEditForm = () => {
  formForEdit.value = undefined
}

const getCenters = async () => {
  loading.value = true
  try {
    const {
      data: { data, meta },
    } = await fetchCenters(params.value)
    items.value = data
    totalPages.value = meta.totalPages
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

getCenters()

const remove = async (id: number) => {
  try {
    deleteLoading.value = true
    await deleteCenter(id)
    getCenters()
  } catch (err) {
    console.log(err)
  } finally {
    deleteLoading.value = false
  }
}

const headers = computed(() => [
  { title: t('centers.table.id'), key: 'id' },
  { title: t('common.name'), key: 'name' },
  { title: t('centers.table.default'), key: 'isDefault' },
  { title: t('common.actions'), key: 'actions' },
])
</script>

<style scoped></style>
