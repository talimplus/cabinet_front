<template>
  <div>
    <v-card>
      <v-card-title class="mb-6 d-flex justify-space-between"
        >{{ $t('rooms.title') }}
        <v-btn v-if="canManageRooms" color="primary" @click="openModal = true">{{ $t('common.create') }}</v-btn>
      </v-card-title>
      <v-row class="px-4">
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="params.name"
            variant="outlined"
            :label="$t('rooms.roomName')"
            density="compact"
            @input="getRooms"
          >
          </v-text-field>
        </v-col>
      </v-row>
      <v-card-text>
        <v-data-table :loading="loading" :items="items" :headers="headers" hide-default-footer>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              density="compact"
              color="medium-emphasis"
              icon="mdi-pencil"
              size="small"
              class="me-2"
              v-if="canManageRooms"
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
              v-if="canManageRooms"
              @click="remove(item.id)"
            >
            </v-btn>
          </div>
        </template>
        </v-data-table>
      </v-card-text>
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
import { usePermissions } from '@/composables/usePermissions'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import CreateRoom from '@/components/pages/room/CreateRoom.vue'
import { fetchRooms } from '@/services/pages/rooms'
import { deleteRoom } from '@/services/pages/rooms'
import type { Room, RoomParams } from '@/types/room.types'

const { canManageRooms } = usePermissions()

const { t } = useI18n()

const formForEdit = ref<Room>()
const openModal = ref(false)
const items = ref<Room[]>([])
const loading = ref(false)

const params = ref<RoomParams>({
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

onMounted(async () => {
  await getRooms()
})

const remove = async (id: number) => {
  try {
    await deleteRoom(id)
    getRooms()
  } catch (err) {
    console.log(err)
  }
}

const headers = computed(() => [
  { title: t('rooms.headers.id'), key: 'id' },
  { title: t('rooms.headers.room'), key: 'name' },
  { title: t('common.actions'), key: 'actions' },
])
</script>
