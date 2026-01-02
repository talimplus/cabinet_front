<template>
  <div>
    <v-card>
      <v-card-title class="mb-6 d-flex justify-space-between"
        >Rooms
        <v-btn color="primary" @click="openModal = true">Create</v-btn>
      </v-card-title>
      <v-row class="px-4">
        <v-col cols="3">
          <v-text-field
            v-model="params.name"
            variant="outlined"
            label="Room Name"
            density="compact"
            @input="getRooms"
          >
          </v-text-field>
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="params.centerId"
            density="compact"
            variant="outlined"
            label="Centers"
            item-title="name"
            item-value="id"
            :items="centers"
            @update:modelValue="getRooms"
          ></v-select>
        </v-col>
      </v-row>
      <v-data-table :loading="loading" :items="items" :headers="headers" hide-default-footer>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              density="compact"
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              class="me-2"
              @click="edit(item)"
              variant="text"
            ></v-btn>
            <v-btn
              teicon="mdi-delete"
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
      <CreateRoom
        :formForEdit="formForEdit"
        v-model:open="openModal"
        @updateData="getRooms"
        @clearEditForm="clearEditForm"
      ></CreateRoom>
    </v-card>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import CreateRoom from '@/components/pages/room/CreateRoom.vue'
import { fetchRooms } from '@/services/pages/rooms'
import { fetchCenters } from '@/services/pages/centers'
import { deleteRoom } from '@/services/pages/rooms'
import type { Room, RoomParams } from '@/types/room.types'

const formForEdit = ref<Room>()
const openModal = ref(false)
const items = ref<Room[]>([])
const centers = ref([])
const loading = ref(false)

const params = ref<RoomParams>({
  centerId: undefined,
  name: '',
})

const edit = (center: Center) => {
  formForEdit.value = center
  openModal.value = true
}

const clearEditForm = () => {
  formForEdit.value = undefined
}

const getRooms = async () => {
  try {
    loading.value = true
    const {
      data: { data },
    } = await fetchRooms(params.value)

    items.value = data
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
getRooms()

const getCenters = async () => {
  try {
    const {
      data: { data },
    } = await fetchCenters()
    centers.value = data
  } catch (err) {
    console.log(err)
  } finally {
  }
}

getCenters()
const remove = async (id: number) => {
  try {
    await deleteRoom(id)
    getRooms()
  } catch (err) {
    console.log(err)
  }
}

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'ROOM', key: 'name' },
  { title: 'Actions', key: 'actions' },
]
</script>
