<template>
  <v-dialog v-model="open" width="800">
    <form @submit.prevent="submit">
      <v-card title="Create User">
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="form.firstName" label="FirstName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.lastName" label="LastName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.login" label="Login"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.phone" label="Phone"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field type="password" v-model="form.password" label="Password"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select :items="userRoles" v-model="form.role" label="Role"></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="form.centerId"
                label="Centers"
                :items="centers"
                item-title="name"
                item-value="id"
              >
              </v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field type="number" v-model="form.salary" label="Salary"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                type="number"
                v-model="form.commissionPercentage"
                label="Commission %"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="open = false" text="Cancel"></v-btn>
          <v-btn color="primary" type="submit" :loading="loading" text="Save"></v-btn>
        </v-card-actions>
      </v-card>
    </form>
  </v-dialog>
</template>
      
     


<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch } from 'vue'
import type { Center } from '@/types/center.types'
import type { UserForm, User } from '@/types/users.types'
import { createUser, updateUser } from '@/services/pages/users'
import { userRoles } from '@/types/users.enum'
interface Props {
  centers: Center[]
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

const form = ref<UserForm>({
  firstName: '',
  lastName: '',
  login: '',
  phone: '',
  password: '',
  role: '',
  centerId: undefined,
  salary: undefined,
  commissionPercentage: undefined,
})

const submit = async () => {
  loading.value = true
  form.value.salary = +form.value.salary
  form.value.commissionPercentage = +form.value.commissionPercentage
  try {
    if (props.formForEdit?.id) {
      await updateUser(form.value, props.formForEdit.id)
    } else {
      await createUser(form.value)
    }
    open.value = false
    emits('updateData')
  } catch (err) {
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
    form.value.role = props.formForEdit.role
    form.value.centerId = props.formForEdit.center.id
    form.value.salary = props.formForEdit.salary
    form.value.commissionPercentage = props.formForEdit.commissionPercentage
  }
  if (!newValue) {
    emits('clearForm')
    form.value = {
      firstName: '',
      lastName: '',
      login: '',
      phone: '',
      password: '',
      role: '',
      centerId: undefined,
      salary: undefined,
      commissionPercentage: undefined,
    }
  }
})
</script>