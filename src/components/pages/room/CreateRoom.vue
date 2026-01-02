<template>
  <v-dialog width="500" v-model="open">
    <form action="" @submit.prevent="submit">
      <v-card title="Create Room">
        <v-card-text>
          <v-text-field v-model="form.name" label="Room name"></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-select
            v-model="form.centerId"
            :items="centers"
            label="Centers"
            item-title="name"
            item-value="id"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn text="Cancel" @click="open = false"></v-btn>
          <v-btn type="submit" :loading="loading" text="submit" color="primary"></v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch } from 'vue'
import { createRoom, updateRoom } from '@/services/pages/rooms.ts'
import { fetchCenters } from '@/services/pages/centers'
import type { RoomForm } from '@/types/room.types'
import type { Center } from '@/types/center.types'

const loading = ref(false)
const centers = ref<Center[]>([])

interface Emits {
  (e: 'updateData'): void
  (e: 'clearEditForm'): void
}
interface Props {
  formForEdit?: RoomForm
}

const emits = defineEmits<Emits>()
const props = defineProps<Props>()
const open = defineModel('open', { type: Boolean })

const form = ref<RoomForm>({
  name: '',
  centerId: '',
})

watch(open, (newValue: boolean) => {
  if (newValue && props.formForEdit?.id) {
    form.value.name = props.formForEdit.name
    form.value.centerId = props.formForEdit?.center?.id
  } else {
    emits('clearEditForm')
    form.value = {
      name: '',
      centerId: '',
    }
  }
})

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

const submit = async () => {
  try {
    loading.value = true
    if (props.formForEdit?.id) {
      await updateRoom(form.value, props.formForEdit.id)
    } else {
      await createRoom(form.value)
    }

    open.value = false
    emits('updateData')
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>