<template>
  <v-snackbar
    v-if="current"
    :key="current.id"
    :model-value="true"
    :color="current.color"
    :timeout="current.timeout"
    location="top right"
    @update:model-value="onUpdate"
  >
    {{ current.message }}
    <template v-slot:actions>
      <v-btn icon="mdi-close" variant="text" size="small" @click="remove(current.id)"></v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '@/stores/notification'

defineOptions({ name: 'AppSnackbar' })

const store = useNotificationStore()
const { queue } = storeToRefs(store)
const { remove } = store

// Navbatdagi bittasini ko'rsatamiz; yopilgach keyingisi chiqadi
const current = computed(() => queue.value[0] ?? null)

const onUpdate = (value: boolean) => {
  if (!value && current.value) remove(current.value.id)
}
</script>
