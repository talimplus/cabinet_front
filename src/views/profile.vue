<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <div v-if="loading" class="text-center pa-12">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="text-h6 mt-4 text-medium-emphasis">Profil yuklanmoqda...</p>
        </div>
        <v-card v-else class="profile-card">
          <v-card-title class="text-h5 pa-6 d-flex align-center">
            <v-avatar size="56" color="primary" class="mr-4">
              <v-icon size="32" color="white">mdi-account</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5">{{ profileData.firstName }} {{ profileData.lastName }}</div>
              <div class="text-caption text-medium-emphasis">{{ getRoleLabel(profileData.role) }}</div>
            </div>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-6">
            <Form ref="formRef" @submit="saveProfile">
              <v-row>
                <v-col cols="12" md="6">
                  <Field name="firstName" v-slot="{ handleChange, handleBlur, errors }">
                    <v-text-field
                      v-model="form.firstName"
                      label="Ism"
                      variant="outlined"
                      density="comfortable"
                      :disabled="loading || saving"
                      :error-messages="errors"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    ></v-text-field>
                  </Field>
                </v-col>
                <v-col cols="12" md="6">
                  <Field name="lastName" v-slot="{ handleChange, handleBlur, errors }">
                    <v-text-field
                      v-model="form.lastName"
                      label="Familiya"
                      variant="outlined"
                      density="comfortable"
                      :disabled="loading || saving"
                      :error-messages="errors"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    ></v-text-field>
                  </Field>
                </v-col>
                <v-col cols="12" md="6">
                  <Field name="login" v-slot="{ handleChange, handleBlur, errors }">
                    <v-text-field
                      v-model="form.login"
                      label="Login"
                      variant="outlined"
                      density="comfortable"
                      :disabled="loading || saving"
                      :error-messages="errors"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    ></v-text-field>
                  </Field>
                </v-col>
                <v-col cols="12" md="6">
                  <Field name="phone" v-slot="{ handleChange, handleBlur, errors }">
                    <v-text-field
                      v-model="form.phone"
                      label="Telefon"
                      variant="outlined"
                      density="comfortable"
                      :disabled="loading || saving"
                      :error-messages="errors"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    ></v-text-field>
                  </Field>
                </v-col>
                <v-col cols="12">
                  <v-divider class="my-4"></v-divider>
                  <div class="text-subtitle-1 font-weight-medium mb-2">Parolni o'zgartirish</div>
                  <Field name="password" v-slot="{ handleChange, handleBlur, errors }">
                    <v-text-field
                      v-model="form.password"
                      label="Yangi parol"
                      type="password"
                      variant="outlined"
                      density="comfortable"
                      hint="Parolni o'zgartirmaslik uchun bo'sh qoldiring"
                      persistent-hint
                      :disabled="loading || saving"
                      :error-messages="errors"
                      @update:model-value="handleChange"
                      @blur="handleBlur"
                    ></v-text-field>
                  </Field>
                </v-col>
              </v-row>

              <!-- Read-only fields -->
              <v-row v-if="profileData.role === 'teacher'">
                <v-col cols="12">
                  <v-divider class="my-4"></v-divider>
                  <div class="text-subtitle-1 font-weight-medium mb-4">Qo'shimcha ma'lumotlar</div>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="formatCurrency(profileData.salary || 0)"
                    label="Maosh"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-cash"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    :model-value="`${profileData.commissionPercentage || 0}%`"
                    label="Komissiya foizi"
                    variant="outlined"
                    density="comfortable"
                    readonly
                    prepend-inner-icon="mdi-percent"
                  ></v-text-field>
                </v-col>
              </v-row>
            </Form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-6">
            <v-spacer></v-spacer>
            <v-btn
              variant="text"
              @click="resetForm"
              :disabled="loading || saving || !hasChanges"
            >
              Bekor qilish
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              @click="formRef?.submitForm()"
              :loading="saving"
              :disabled="loading || !hasChanges"
            >
              Saqlash
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> Yopish </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Form, Field } from 'vee-validate'
import type { UserProfile, UpdateProfileForm } from '@/types/user.types'
import { getUserMe, updateUserMe } from '@/services/pages/users'

// Component name
defineOptions({
  name: 'ProfilePage',
})

// State
const profileData = ref<UserProfile>({
  id: 0,
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  password: '',
  role: '',
  centerId: 0,
})

const form = ref<UpdateProfileForm>({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  password: '',
})

const initialForm = ref<UpdateProfileForm>({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  password: '',
})

const loading = ref(false)
const saving = ref(false)
const formRef = ref()

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

// Computed
const hasChanges = computed(() => {
  return (
    form.value.firstName !== initialForm.value.firstName ||
    form.value.lastName !== initialForm.value.lastName ||
    form.value.login !== initialForm.value.login ||
    form.value.phone !== initialForm.value.phone ||
    (form.value.password && form.value.password.length > 0)
  )
})

// Methods
const loadProfile = async () => {
  loading.value = true
  try {
    const data = await getUserMe()
    profileData.value = data
    form.value = {
      firstName: data.firstName,
      lastName: data.lastName,
      login: data.login,
      phone: data.phone,
      password: '',
    }
    initialForm.value = { ...form.value }
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.message || 'Profil ma\'lumotlarini yuklashda xatolik',
      'error',
    )
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  form.value = { ...initialForm.value }
  formRef.value?.resetForm?.({ values: form.value })
}

const saveProfile = async () => {
  saving.value = true
  try {
    const updateData: UpdateProfileForm = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      login: form.value.login,
      phone: form.value.phone,
    }

    // Only include password if it's provided
    if (form.value.password && form.value.password.length > 0) {
      updateData.password = form.value.password
    }

    await updateUserMe(updateData)
    showSnackbar('Profil muvaffaqiyatli yangilandi', 'success')
    await loadProfile()
  } catch (error: any) {
    const errors = error?.response?.data?.errors
    if (errors) {
      formRef.value?.setErrors(errors)
    }
    showSnackbar(error.response?.data?.message || 'Profilni yangilashda xatolik', 'error')
  } finally {
    saving.value = false
  }
}

const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " so'm"
  )
}

const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    super_admin: 'Super Administrator',
    teacher: "O'qituvchi",
    reception: 'Qabul',
    manager: 'Menejer',
  }
  return roleLabels[role] || role
}

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}

// Lifecycle
onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-card :deep(.v-card-title) {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%);
}
</style>
