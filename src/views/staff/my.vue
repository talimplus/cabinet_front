<template>
  <div>
    <h1 class="text-h5 mb-4">{{ $t('staff.myTitle') }}</h1>

    <!-- O'z sahifasi: jarima yozish/oylik to'lash tugmalari ko'rsatilmaydi -->
    <StaffOverview :user-id="null" />
  </div>
</template>

<script setup lang="ts">
import StaffOverview from '@/components/pages/staff/StaffOverview.vue'

defineOptions({ name: 'MyPerformancePage' })
</script>
