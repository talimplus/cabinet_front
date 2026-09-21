<template>
  <v-dialog v-model="open" width="800">
    <Form @submit="submit" ref="userFormRef">
      <v-card :title="$t('users.form.createTitle')">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <Field name="firstName" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.firstName"
                  :label="$t('users.form.firstName')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="lastName" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.lastName"
                  :label="$t('users.form.lastName')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="login" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.login"
                  :label="$t('users.form.login')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="phone" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.phone"
                  :label="$t('users.form.phone')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="password" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  type="password"
                  v-model="form.password"
                  :label="$t('users.form.password')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col v-if="canViewRoles" cols="12" sm="6">
              <Field name="roleId" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  :items="roleItems"
                  item-title="name"
                  item-value="id"
                  :loading="rolesLoading"
                  v-model="form.roleId"
                  :label="$t('users.form.role')"
                  :hint="$t('users.form.roleHint')"
                  persistent-hint
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-select>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="salary" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  type="number"
                  v-model="form.salary"
                  :label="$t('users.form.salary')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12" sm="6">
              <Field name="commissionPercentage" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  type="number"
                  v-model="form.commissionPercentage"
                  :label="$t('users.form.commissionPercentage')"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="open = false" :text="$t('common.cancel')"></v-btn>
          <v-btn v-if="props.formForEdit?.id ? canEditUser : canCreateUser" color="primary" type="submit" :loading="loading" :disabled="loading" :text="$t('common.save')"></v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>
      
     


<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, defineProps, defineModel, defineEmits, watch, computed, onMounted } from 'vue'
import { Form, Field } from 'vee-validate'
import type { UserForm, User } from '@/types/users.types'
import type { Role } from '@/types/roles.types'
import { createUser, updateUser } from '@/services/pages/users'
import { fetchRoles } from '@/services/pages/roles'
import { useCenterStore } from '@/stores/center'

const { canEditUser, canCreateUser, can } = usePermissions()

/** Rollar ro'yxati `roles.view` bilan keladi — ruxsat bo'lmasa select ko'rsatilmaydi */
const canViewRoles = computed(() => can('roles.view'))

const centerStore = useCenterStore()

interface Props {
  formForEdit: User
}

interface Emits {
  (e: 'updateData'): void
  (e: 'clearForm'): void
}
const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel('open')
const loading = ref(false)
const userFormRef = ref()

// Rollar backenddan keladi — admin yaratgan yangi rollar shu yerda avtomatik chiqadi.
const roles = ref<Role[]>([])
const rolesLoading = ref(false)

// Administrator roli markaz egasiniki — xodimga biriktirib bo'lmaydi.
const roleItems = computed(() => roles.value.filter((role) => role.baseRole !== 'admin'))

const loadRoles = async () => {
  if (!canViewRoles.value) return
  rolesLoading.value = true
  try {
    roles.value = await fetchRoles()
  } finally {
    rolesLoading.value = false
  }
}

onMounted(loadRoles)

const emptyForm = (): UserForm => ({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  password: '',
  roleId: undefined,
  centerId: undefined,
  salary: undefined,
  commissionPercentage: undefined,
})

const form = ref<UserForm>(emptyForm())

const submit = async () => {
  loading.value = true
  form.value.salary = +(form.value.salary ?? 0)
  form.value.commissionPercentage = +(form.value.commissionPercentage ?? 0)
  try {
    if (props.formForEdit?.id) {
      await updateUser(form.value, props.formForEdit.id)
    } else {
      await createUser(form.value)
    }
    open.value = false
    emits('updateData')
  } catch (err) {
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      userFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}

watch(open, (newValue) => {
  if (newValue && props.formForEdit?.id) {
    form.value.firstName = props.formForEdit.firstName
    form.value.lastName = props.formForEdit.lastName
    form.value.login = props.formForEdit.login
    form.value.phone = props.formForEdit.phone
    form.value.password = props.formForEdit.password
    form.value.roleId = props.formForEdit.userRole?.id
    form.value.centerId = props.formForEdit.center?.id
    form.value.salary = props.formForEdit.salary
    form.value.commissionPercentage = props.formForEdit.commissionPercentage
  }
  if (!newValue) {
    emits('clearForm')
    form.value = emptyForm()
  }
  // Filial header'dan: aktiv filial ("barchasi" bo'lsa — standart filial).
  // Admin bo'lmaganlarga `null` — backend o'z filialini qo'yadi.
  if (newValue && !props.formForEdit?.id) {
    form.value.centerId = centerStore.centerIdForCreate ?? undefined
  }
})
</script>