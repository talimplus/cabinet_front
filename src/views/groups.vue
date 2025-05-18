<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Groups
      <v-btn color="primary">Create</v-btn>
    </v-card-title>
    <v-data-table :items="items" :headers="headers" hide-default-footer>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            variant="text"
          ></v-btn>
          <v-btn
            :loading="deleteLoading"
            teicon="mdi-delete"
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
          >
          </v-btn>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Group } from '@/types/groups.types'
import { fetchGroups } from '@/services/pages/groups'

const items = ref<Group[]>([])

const getGroups = async () => {
  try {
    const {
      data: { data },
    } = await fetchGroups()
    items.value = data
  } catch (err) {
    console.log(err)
  }
}
getGroups()

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Name', key: 'name' },
  { title: 'Group', key: 'name' },
  { title: 'Teacher', key: 'name' },
  { title: 'Actions', key: 'actions' },
]
</script>

<style scoped>
</style>