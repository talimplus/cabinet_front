<template>
  <v-dialog v-model="open" width="auto">
    <form @submit.prevent="submit">
      <v-card width="400" title="Create Center">
        <v-card-text>
          <v-text-field v-model="form.name" label="Center name"></v-text-field>
          <v-checkbox
            v-model="form.isDefault"
            label="Default markaz"
            density="compact"
            class="mt-2"
          ></v-checkbox>
        </v-card-text>
        <template v-slot:actions>
          <v-btn text="Cancel" @click="open = false"></v-btn>
          <v-btn :loading="loading" type="submit" color="primary" text="Save"></v-btn>
        </template>
      </v-card>
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, defineEmits, defineModel } from 'vue'
import type { CenterForm } from '@/types/centers.types'
import { createCenter, editCenter } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'

interface Props {
  test: { name: string }
  formForEdit: Center
}

interface Emits {
  (e: 'close'): void
  (e: 'updateData'): void
  (e: 'clearEditForm'): void
  (e: 'chaqiryapman', text: string, kilo: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel('open', {default: false})

// const dialog = ref(false)
const loading = ref(false)
const form = ref<CenterForm>({
  name: '',
  isDefault: false,
})

watch(
  () => open.value,
  (newValue) => {
    if (newValue && props.formForEdit?.id) {
      form.value.name = props.formForEdit.name
      form.value.isDefault = props.formForEdit.isDefault || false
    } else {
      emits('clearEditForm')
      form.value = {
        name: '',
        isDefault: false,
      }
    }
  }
)

const submit = async () => {
  try {
    loading.value = true
    if (props.formForEdit?.id) {
      await editCenter(form.value, props.formForEdit.id)
    } else {
      await createCenter(form.value)
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

<style scoped>
</style>
