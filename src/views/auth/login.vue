<template>
  <div class="d-flex align-center justify-center h-screen">
    <v-card width="400" max-width="100%">
      <v-card-text>
        <form @submit.prevent="submit">
          <v-text-field
            v-model="form.email"
            :counter="10"
            label="Email"
            required
            density="compact"
            variant="outlined"
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            required
            density="compact"
            variant="outlined"
          ></v-text-field>

          <v-btn color="primary" class="me-4" type="submit" :loading="loading"> submit </v-btn>
        </form>
      </v-card-text>
    </v-card>
  </div>
</template>
      <script setup lang="ts">
import { ref } from 'vue'
import type { LoginForm } from '@/types/auth.types'
import { login } from '@/services/pages/auth'

import { useRouter } from 'vue-router'
const router = useRouter()

const loading = ref(false)

const form = ref<LoginForm>({
  email: '',
})
const submit = async () => {
  loading.value = true
  try {
    const { data } = await login(form.value)
    if (data?.access_token) {
      localStorage.setItem('token', data.access_token)
      router.push('/users')
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>