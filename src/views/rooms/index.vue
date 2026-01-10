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
import { ref, onMounted } from 'vue'
import CreateRoom from '@/components/pages/room/CreateRoom.vue'
import { fetchRooms } from '@/services/pages/rooms'
import { fetchAllCenters } from '@/services/pages/centers'
import { deleteRoom } from '@/services/pages/rooms'
import type { Room, RoomParams } from '@/types/room.types'
import type { Center } from '@/types/centers.types'

const formForEdit = ref<Room>()
const openModal = ref(false)
const items = ref<Room[]>([])
const centers = ref<Center[]>([])
const loading = ref(false)

const params = ref<RoomParams>({
  centerId: undefined,
  name: '',
})

const edit = (room: Room) => {
  formForEdit.value = room
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

const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !params.value.centerId) {
      const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
      params.value.centerId = defaultCenter.id
    }
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  await getCenters()
  if (params.value.centerId) {
    await getRooms()
  }
})

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
