<template>
  <div>
    <router-view />
    <AppSnackbar />
  </div>
</template>

<script setup lang="ts">
import AppSnackbar from '@/components/AppSnackbar.vue'
</script>

<style scoped>
</style>