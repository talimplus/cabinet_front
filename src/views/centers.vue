<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Centers
      <v-btn @click="dialog = true" color="primary">Create</v-btn>
    </v-card-title>
    <v-row class="px-4">
      <v-col cols="3">
        <v-text-field
          @input="getCenters"
          v-model="params.name"
          variant="outlined"
          label="Center Name"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :items="items" :headers="headers" hide-default-footer :loading="loading">
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
    <CenterCreate
      :formForEdit="formForEdit"
      :open="dialog"
      @close="dialog = false"
      @updateData="getCenters"
      @clearEditForm="clearEditForm"
    ></CenterCreate>
  </v-card>
</template>

<script setup lang="ts">
import CenterCreate from '@/components/pages/center/CenterCreate.vue'
import { ref } from 'vue'
import { fetchCenters, deleteCenter } from '@/services/pages/centers'
import type { Center, CentersParams } from '@/types/center.types'

const loading = ref(false)
const items = ref<Center[]>([])
const dialog = ref(false)
const formForEdit = ref<Center>()
const deleteLoading = ref(false)
const totalPages = ref(0)

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

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Actions', key: 'actions' },
]
</script>

<style scoped>
</style>