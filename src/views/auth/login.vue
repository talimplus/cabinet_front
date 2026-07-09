<template>
  <div class="login-container">
    <div class="login-left">
      <div class="login-logo">
        <img src="/talimplus-logo.svg" alt="TalimPlus" class="logo-img" />
      </div>
      <div class="login-illustration">
        <img src="@/assets/images/login.png" alt="Login illustration" />
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h1 class="login-title">{{ $t('auth.welcome') }}</h1>
          <p class="login-subtitle">{{ $t('auth.subtitle') }}</p>
        </div>

        <Form @submit="submit" ref="formRef">
          <Field name="email" rules="required|email" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.email"
              :label="$t('auth.email')"
              type="email"
              variant="outlined"
              density="comfortable"
              :disabled="loading"
              class="mb-4"
              prepend-inner-icon="mdi-email-outline"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>

          <Field name="password" rules="required" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.password"
              :label="$t('auth.password')"
              type="password"
              variant="outlined"
              density="comfortable"
              :disabled="loading"
              class="mb-4"
              prepend-inner-icon="mdi-lock-outline"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>

          <v-btn
            color="primary"
            size="large"
            type="submit"
            :loading="loading"
            :disabled="loading"
            block
            class="mb-4 login-submit"
          >
            {{ $t('auth.login') }}
          </v-btn>
        </Form>

        <div class="login-footer">
          <span class="footer-text">{{ $t('auth.newHere') }}</span>
          <router-link to="/register" class="footer-link">{{ $t('auth.createAccount') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Form, Field } from 'vee-validate'
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

const submit = async () => {
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
    const errors = err?.response?.data?.errors
    if (errors) {
      formRef.value?.setErrors(errors)
    } else if (err.response.data.message) {
      formRef.value?.setErrors({
        email: err.response.data.message,
      })
    }
    console.error('Login error:', err)
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
  background:
    radial-gradient(circle at 30% 20%, rgba(1, 192, 200, 0.1), transparent 55%),
    radial-gradient(circle at 80% 80%, rgba(1, 192, 200, 0.08), transparent 50%),
    #f4f5fa;
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

.logo-img {
  height: 64px;
  width: auto;
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
  margin-bottom: 28px;
}

.login-title {
  font-size: 26px;
  font-weight: 600;
  color: rgba(46, 38, 61, 0.9);
  margin-bottom: 8px;
  line-height: 1.3;
  text-wrap: balance;
}

.login-subtitle {
  font-size: 15px;
  color: rgba(46, 38, 61, 0.68);
  margin: 0;
  line-height: 1.5;
}

.login-submit {
  letter-spacing: 0.02em;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: rgba(46, 38, 61, 0.68);
}

.footer-link {
  color: rgb(1, 192, 200);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: rgb(0, 170, 177);
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
