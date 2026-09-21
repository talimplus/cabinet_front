<template>
  <div>
    <div class="d-flex align-center mb-4" style="gap: 12px">
      <v-btn icon="mdi-arrow-left" variant="text" @click="goBack"></v-btn>
      <h1 class="text-h5">{{ $t('staff.title') }}</h1>
    </div>

    <StaffOverview :user-id="userId" show-actions />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StaffOverview from '@/components/pages/staff/StaffOverview.vue'

defineOptions({ name: 'StaffViewPage' })

const route = useRoute()
const router = useRouter()

const userId = computed(() => Number(route.params.id))

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/users')
}
</script>
