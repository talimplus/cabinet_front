<template>
  <div class="register-container">
    <div class="register-left">
      <div class="register-logo">
        <v-icon size="40" color="white">mdi-school</v-icon>
        <span class="logo-text">Ta'lim Markazi</span>
      </div>
      <div class="register-illustration">
        <img src="@/assets/images/login.png" alt="Register illustration" />
      </div>
    </div>
    <div class="register-right">
      <div class="register-form-wrapper">
        <div class="register-header">
          <h1 class="register-title">Welcome to Ta'lim Markazi</h1>
          <p class="register-subtitle">Create Your Account</p>
        </div>

        <v-divider class="my-6">
          <span class="divider-text">or sign up with</span>
        </v-divider>

        <v-form @submit.prevent="submit" ref="formRef">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.firstName"
                label="First Name"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="loading"
                prepend-inner-icon="mdi-account-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.lastName"
                label="Last Name"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="loading"
                prepend-inner-icon="mdi-account-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.email]"
                :disabled="loading"
                prepend-inner-icon="mdi-email-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.phone"
                label="Phone"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.phone]"
                :disabled="loading"
                prepend-inner-icon="mdi-phone-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.organizationName"
                label="Organization Name"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="loading"
                prepend-inner-icon="mdi-office-building-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.centerName"
                label="Center Name"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="loading"
                prepend-inner-icon="mdi-domain"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.password"
                label="Password"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.password]"
                :disabled="loading"
                prepend-inner-icon="mdi-lock-outline"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="confirmPass"
                label="Confirm Password"
                type="password"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.passwordMatch]"
                :disabled="loading"
                prepend-inner-icon="mdi-lock-check-outline"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-btn
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            :disabled="loading"
            block
            class="mt-4 mb-4"
          >
            Complete Registration
          </v-btn>
        </v-form>

        <div class="register-footer">
          <span class="footer-text">Already have an account?</span>
          <router-link to="/login" class="footer-link">Log In</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { RegisterForm } from '@/types/auth.types'
import { register } from '@/services/pages/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref()

const confirmPass = ref('')
const loading = ref(false)

const form = ref<RegisterForm>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  organizationName: '',
  centerName: '',
})

const rules = {
  required: (v: string) => !!v || "Maydon to'ldirilishi shart",
  email: (v: string) => {
    if (!v) return true
    return /.+@.+\..+/.test(v) || "Email noto'g'ri formatda"
  },
  phone: (v: string) => {
    if (!v) return true
    const phoneRegex = /^\+?998\d{9}$/
    return phoneRegex.test(v.replace(/\s/g, '')) || "Telefon raqami noto'g'ri formatda"
  },
  password: (v: string) => {
    if (!v) return true
    return v.length >= 6 || "Parol kamida 6 belgidan iborat bo'lishi kerak"
  },
  passwordMatch: (v: string) => {
    if (!v) return true
    return v === form.value.password || 'Parollar mos kelmaydi'
  },
}

const submit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    await register(form.value)
    router.push('/login')
  } catch (err: any) {
    console.error('Register error:', err)
    // You can add error notification here
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.register-left {
  flex: 1;
  background: #f3f3f3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
  overflow: hidden;
}

.register-logo {
  position: absolute;
  top: 40px;
  left: 40px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 10;
}

.logo-text {
  font-size: 24px;
  font-weight: 600;
  color: #1976d2;
}

.register-illustration {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-illustration img {
  max-width: 70%;
  height: auto;
  object-fit: contain;
}

.register-right {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.register-form-wrapper {
  width: 100%;
  max-width: 600px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.2;
}

.register-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #9ca3af;
  font-size: 14px;
}

.register-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;
}

.footer-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

@media (max-width: 960px) {
  .register-container {
    flex-direction: column;
  }

  .register-left {
    min-height: 300px;
    padding: 20px;
  }

  .register-logo {
    top: 20px;
    left: 20px;
  }

  .register-right {
    padding: 20px;
  }
}
</style>
