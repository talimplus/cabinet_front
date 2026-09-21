<template>
  <v-dialog width="500" v-model="open">
    <Form @submit="submit" ref="roomFormRef">
      <v-card :title="$t('rooms.createRoom')">
        <v-card-text>
          <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              :label="$t('rooms.roomName')"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-actions>
          <v-btn :text="$t('common.cancel')" @click="open = false"></v-btn>
          <v-btn v-if="canManageRooms" type="submit" :loading="loading" :disabled="loading" :text="$t('rooms.submit')" color="primary"></v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, defineProps, defineModel, defineEmits, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { createRoom, updateRoom } from '@/services/pages/rooms.ts'
import type { RoomForm } from '@/types/room.types'
import { useCenterStore } from '@/stores/center'

const { canManageRooms } = usePermissions()

const loading = ref(false)
const centerStore = useCenterStore()

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
const roomFormRef = ref()

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
  // Filial header'dan: aktiv filial ("barchasi" bo'lsa — standart filial)
  if (newValue && !props.formForEdit?.id) {
    form.value.centerId = centerStore.centerIdForCreate ?? ''
  }
})

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
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      roomFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>