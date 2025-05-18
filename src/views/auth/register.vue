<template>
  <form @submit.prevent="submit">
    <v-card class="mx-auto mt-10" max-width="600" title="User Registration">
      <v-container>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.firstName"
              color="primary"
              label="First name"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.lastName"
              color="primary"
              label="Last name"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.password"
              color="primary"
              label="Password"
              type="password"
              placeholder="Enter your password"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="confirmPass"
              color="primary"
              label="Confirm Password"
              type="password"
              placeholder="Confirm password"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.organizationName"
              color="primary"
              label="Organization Name"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.centerName"
              color="primary"
              label="Center Name"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.phone"
              color="primary"
              label="Your Phone"
              variant="underlined"
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field
              v-model="form.email"
              color="primary"
              label="Your Emali"
              variant="underlined"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>

      <v-divider>
        <div>
          Already have account
          <router-link to="/login" class="text-primary text-decoration-none">Log In</router-link>
        </div>
      </v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn color="success" type="submit" :loading="loading">
          Complete Registration

          <v-icon icon="mdi-chevron-right" end></v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </form>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import type { RegisterForm } from '@/types/auth.types'
import { register } from '@/services/pages/auth'
import { useRoute } from 'vue-router'

const route = useRoute()

const confirmPass = ref('')
const loading = ref(false)

const form = ref<RegisterForm>({
  firstName: '',
})
const submit = async () => {
  loading.value = true
  try {
    await register(form.value)
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>