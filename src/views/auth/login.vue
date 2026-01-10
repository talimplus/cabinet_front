<template>
  <div class="login-container">
    <div class="login-left">
        <div class="login-logo">
          <v-icon size="40" color="#01c0c8">mdi-school</v-icon>
          <span class="logo-text">LITECH</span>
        </div>
      <div class="login-illustration">
        <img src="@/assets/images/login.png" alt="Login illustration" />
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h1 class="login-title">Welcome to LITECH</h1>
          <p class="login-subtitle">Your Admin Dashboard</p>
        </div>

        <v-divider class="my-6">
          <span class="divider-text">or sign in with</span>
        </v-divider>

        <v-form @submit.prevent="submit" ref="formRef">
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.email]"
            :disabled="loading"
            class="mb-4"
            prepend-inner-icon="mdi-email-outline"
          ></v-text-field>

          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            :disabled="loading"
            class="mb-4"
            prepend-inner-icon="mdi-lock-outline"
          ></v-text-field>

          <v-btn
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            :disabled="loading"
            block
            class="mb-4"
          >
            Sign In
          </v-btn>
        </v-form>

        <div class="login-footer">
          <span class="footer-text">New to Ta'lim Markazi?</span>
          <router-link to="/register" class="footer-link">Create an account</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { LoginForm } from '@/types/auth.types'
import { login } from '@/services/pages/auth'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()

const loading = ref(false)

const form = ref<LoginForm>({
  email: '',
  password: '',
})

const rules = {
  required: (v: string) => !!v || 'Maydon to\'ldirilishi shart',
  email: (v: string) => {
    if (!v) return true
    return /.+@.+\..+/.test(v) || 'Email noto\'g\'ri formatda'
  },
}

const submit = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  loading.value = true
  try {
    const { data } = await login(form.value)
    if (data?.access_token && data?.user) {
      localStorage.setItem('token', data.access_token)
      userStore.setUser(data.user)

      // Redirect based on role
      const userRole = data.user.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/statistics')
      } else {
        router.push('/profile')
      }
    }
  } catch (err: any) {
    console.error('Login error:', err)
    // You can add error notification here
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.login-left {
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

.login-logo {
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
  color: #6cd219;
}

.login-illustration {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-illustration img {
  max-width: 70%;
  height: auto;
  object-fit: contain;
}

.login-right {
  flex: 1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.2;
}

.login-subtitle {
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

.login-footer {
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
  .login-container {
    flex-direction: column;
  }

  .login-left {
    min-height: 300px;
    padding: 20px;
  }

  .login-logo {
    top: 20px;
    left: 20px;
  }

  .login-right {
    padding: 20px;
  }
}
</style>
