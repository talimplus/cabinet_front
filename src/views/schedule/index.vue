<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5">{{ $t('schedule.title') }}</h1>
      <div class="text-body-2 text-medium-emphasis">{{ $t('schedule.subtitle') }}</div>
    </div>

    <v-card>
      <v-card-text>
        <ScheduleBoard />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import ScheduleBoard from '@/components/pages/schedule/ScheduleBoard.vue'

defineOptions({ name: 'SchedulePage' })
</script>
