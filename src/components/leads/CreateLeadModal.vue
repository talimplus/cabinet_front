<template>
  <v-dialog width="820" v-model="open">
    <Form @submit="submit" ref="leadFormRef">
      <v-card :title="props.formForEdit?.id ? 'Leadni tahrirlash' : 'Yangi lead'">
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <Field name="firstName" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.firstName"
                  label="Ism"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="lastName" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.lastName"
                  label="Familiya"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="phone" rules="required" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.phone"
                  label="Telefon"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="secondPhone" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.secondPhone"
                  label="2-telefon"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="birthDate" v-slot="{ handleChange, handleBlur, errors }">
                <v-date-input
                  label="Tug'ilgan sana"
                  prepend-icon=""
                  prepend-inner-icon="$calendar"
                  v-model="form.birthDate"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-date-input>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="monthlyFee" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.monthlyFee"
                  label="Oylik to'lov"
                  type="number"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="heardAboutUs" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.heardAboutUs"
                  label="Qayerdan eshitgan"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="preferredTime" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  v-model="form.preferredTime"
                  :items="preferredTimeOptions"
                  item-title="title"
                  item-value="value"
                  label="Qaysi vaqtda o'qimoqchi"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-select>
              </Field>
            </v-col>
            <v-col cols="12">
              <Field name="preferredDays" v-slot="{ handleChange, handleBlur, errors }">
                <v-autocomplete
                  v-model="form.preferredDays"
                  :items="dayList"
                  multiple
                  chips
                  label="Qaysi kunlari o'qimoqchi"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-autocomplete>
              </Field>
            </v-col>

            <v-col v-if="isAdmin" cols="6">
              <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  :items="centers"
                  item-title="name"
                  item-value="id"
                  v-model="form.centerId"
                  label="Markaz"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-select>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="groupIds" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  :items="groups"
                  item-title="name"
                  item-value="id"
                  multiple
                  v-model="form.groupIds"
                  label="Guruhlar"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-select>
              </Field>
            </v-col>

            <v-col cols="12">
              <v-tabs v-model="identityTab" density="compact" color="primary">
                <v-tab value="passport">Passport</v-tab>
                <v-tab value="jshshir">JSHSHIR</v-tab>
              </v-tabs>
            </v-col>
            <v-col cols="12">
              <v-window v-model="identityTab">
                <v-window-item value="passport">
                  <v-row dense>
                    <v-col cols="6">
                      <Field name="passportSeries" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="form.passportSeries"
                          label="Passport seriya"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                    <v-col cols="6">
                      <Field name="passportNumber" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="form.passportNumber"
                          label="Passport raqam"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                  </v-row>
                </v-window-item>
                <v-window-item value="jshshir">
                  <v-row dense>
                    <v-col cols="6">
                      <Field name="jshshir" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="form.jshshir"
                          label="JSHSHIR"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                  </v-row>
                </v-window-item>
              </v-window>
            </v-col>

            <v-col cols="6">
              <Field name="discountPercent" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.discountPercent"
                  label="Chegirma foizi"
                  type="number"
                  suffix="%"
                  :min="0"
                  :max="100"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="discountReason" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.discountReason"
                  label="Chegirma sababi"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="12">
              <Field name="comment" v-slot="{ handleChange, handleBlur, errors }">
                <v-textarea
                  v-model="form.comment"
                  label="Izoh"
                  rows="2"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-textarea>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="followUpDate" v-slot="{ handleChange, handleBlur, errors }">
                <v-date-input
                  label="Keyinroq sanasi"
                  prepend-icon=""
                  prepend-inner-icon="$calendar"
                  v-model="form.followUpDate"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-date-input>
              </Field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="open = false" :disabled="saving || transferring">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            type="submit"
            :loading="saving"
            :disabled="saving || transferring"
          >
            {{ props.formForEdit?.id ? "O'zgartirish" : "Qo'shish" }}
          </v-btn>
          <v-btn
            color="secondary"
            variant="outlined"
            @click="transferToStudent"
            :loading="transferring"
            :disabled="saving || transferring || !props.formForEdit?.id"
          >
            Yangi o'quvchi yaratish
          </v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch, computed } from 'vue'
import { Form, Field } from 'vee-validate'
import type { Lead, LeadForm } from '@/types/leads.types'
import { LeadStatus } from '@/types/leads.enum'
import type { Center } from '@/types/centers.types'
import type { Group } from '@/types/groups.types'
import { fetchAllCenters } from '@/services/pages/centers'
import { fetchAllGroups } from '@/services/pages/groups'
import { createLead, updateLead, transferLeadToStudent } from '@/services/pages/leads'
import { useUserStore } from '@/stores/user'
import { WeekDay } from '@/types/groups.enum'
import dayjs from 'dayjs'

const open = defineModel('open')
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const leadFormRef = ref()
const saving = ref(false)
const transferring = ref(false)

const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const userStore = useUserStore()
const isAdmin = computed(() => userStore.user?.role === 'admin' || userStore.user?.role === 'super_admin')

interface Props {
  formForEdit?: Lead | null
}

interface Emits {
  (e: 'updateData'): void
  (e: 'clearForm'): void
}

const form = ref<LeadForm>({
  phone: '',
  firstName: '',
  lastName: '',
  secondPhone: '',
  birthDate: '',
  monthlyFee: undefined,
  discountPercent: undefined,
  discountReason: undefined,
  comment: '',
  heardAboutUs: '',
  preferredTime: undefined,
  preferredDays: [],
  passportSeries: '',
  passportNumber: '',
  jshshir: '',
  status: LeadStatus.NEW,
  groupIds: [],
  centerId: undefined,
  followUpDate: undefined,
})

const identityTab = ref<'passport' | 'jshshir'>('passport')

const preferredTimeOptions = [
  { title: 'Ertalab', value: 'morning' },
  { title: 'Kechqurun', value: 'evening' },
]

const dayList = computed(() => {
  return [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
    WeekDay.SUNDAY,
  ]
})

const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
  } catch (err) {
    console.log(err)
  }
}

const getGroups = async (centerId?: number) => {
  try {
    const { data } = await fetchAllGroups(centerId)
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}

watch(open, (newValue) => {
  if (newValue) {
    getCenters()
  }
  if (newValue && props.formForEdit?.id) {
    form.value = {
      phone: props.formForEdit.phone,
      firstName: props.formForEdit.firstName || '',
      lastName: props.formForEdit.lastName || '',
      secondPhone: props.formForEdit.secondPhone || '',
      birthDate: props.formForEdit.birthDate || '',
      monthlyFee: props.formForEdit.monthlyFee ?? undefined,
      discountPercent: props.formForEdit.discountPercent ?? undefined,
      discountReason: props.formForEdit.discountReason ?? undefined,
      comment: props.formForEdit.comment || '',
      heardAboutUs: props.formForEdit.heardAboutUs || '',
      preferredTime: props.formForEdit.preferredTime || undefined,
      preferredDays: props.formForEdit.preferredDays || [],
      passportSeries: props.formForEdit.passportSeries || '',
      passportNumber: props.formForEdit.passportNumber || '',
      jshshir: props.formForEdit.jshshir || '',
      status: props.formForEdit.status || LeadStatus.NEW,
      groupIds: props.formForEdit.groupIds || [],
      centerId: props.formForEdit.centerId || userStore.user?.centerId,
      followUpDate: props.formForEdit.followUpDate || undefined,
    }

    if (form.value.jshshir && !form.value.passportSeries && !form.value.passportNumber) {
      identityTab.value = 'jshshir'
    } else {
      identityTab.value = 'passport'
    }

    if (form.value.centerId) {
      getGroups(form.value.centerId)
    }
  }

  if (!newValue) {
    emit('clearForm')
    form.value = {
      phone: '',
      firstName: '',
      lastName: '',
      secondPhone: '',
      birthDate: '',
      monthlyFee: undefined,
      discountPercent: undefined,
      discountReason: undefined,
      comment: '',
      heardAboutUs: '',
      preferredTime: undefined,
      preferredDays: [],
      passportSeries: '',
      passportNumber: '',
      jshshir: '',
      status: LeadStatus.NEW,
      groupIds: [],
      centerId: undefined,
      followUpDate: undefined,
    }
    identityTab.value = 'passport'
    groups.value = []
  }
})

watch(centers, (newCenters) => {
  if (!open.value || props.formForEdit?.id) return
  if (isAdmin.value && newCenters.length > 0 && !form.value.centerId) {
    const defaultCenter = newCenters.find(c => c.isDefault) || newCenters[0]
    form.value.centerId = defaultCenter.id
  } else if (!isAdmin.value && userStore.user?.centerId) {
    form.value.centerId = userStore.user.centerId
  }
  if (form.value.centerId) {
    getGroups(form.value.centerId)
  }
})

watch(identityTab, (value) => {
  if (value === 'passport') {
    form.value.jshshir = ''
  } else {
    form.value.passportSeries = ''
    form.value.passportNumber = ''
  }
})

watch(() => form.value.centerId, (newCenterId, oldCenterId) => {
  if (newCenterId && newCenterId !== oldCenterId) {
    getGroups(newCenterId)
    form.value.groupIds = []
  } else if (!newCenterId) {
    groups.value = []
    form.value.groupIds = []
  }
})

const cleanOptionalFields = (payload: LeadForm) => {
  const optionalStringFields: (keyof LeadForm)[] = [
    'firstName',
    'lastName',
    'secondPhone',
    'comment',
    'heardAboutUs',
    'preferredTime',
    'passportSeries',
    'passportNumber',
    'jshshir',
    'discountReason',
  ]

  optionalStringFields.forEach((field) => {
    const value = payload[field]
    if (value === undefined || value === null || value === '') {
      delete payload[field]
    }
  })

  if (!payload.preferredDays || payload.preferredDays.length === 0) {
    delete payload.preferredDays
  }
  if (!payload.groupIds || payload.groupIds.length === 0) {
    delete payload.groupIds
  }

  if (payload.monthlyFee === undefined || payload.monthlyFee === null || payload.monthlyFee === '') {
    delete payload.monthlyFee
  }
  if (
    payload.discountPercent === undefined ||
    payload.discountPercent === null ||
    payload.discountPercent === '' ||
    payload.discountPercent === 0 ||
    payload.discountPercent === '0'
  ) {
    delete payload.discountPercent
  }
}

const submit = async () => {
  saving.value = true
  const payload: LeadForm = { ...form.value }

  if (payload.birthDate) {
    payload.birthDate = dayjs(payload.birthDate).format('YYYY-MM-DD')
  } else {
    delete payload.birthDate
  }

  if (payload.monthlyFee !== undefined && payload.monthlyFee !== null && payload.monthlyFee !== '') {
    payload.monthlyFee = +payload.monthlyFee
    if (Number.isNaN(payload.monthlyFee)) delete payload.monthlyFee
  }

  if (payload.discountPercent !== undefined && payload.discountPercent !== null && payload.discountPercent !== '') {
    payload.discountPercent = Number(payload.discountPercent)
    if (Number.isNaN(payload.discountPercent)) {
      delete payload.discountPercent
    }
  }

  cleanOptionalFields(payload)

  if (!isAdmin.value) {
    delete payload.centerId
  }

  try {
    if (props.formForEdit?.id) {
      await updateLead(props.formForEdit.id, payload)
    } else {
      payload.status = LeadStatus.NEW
      await createLead(payload)
    }
    open.value = false
    emit('updateData')
  } catch (err: any) {
    const errors = err?.response?.data?.errors
    if (errors) {
      leadFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    saving.value = false
  }
}

const transferToStudent = async () => {
  if (!props.formForEdit?.id) return
  transferring.value = true
  const payload: LeadForm = { ...form.value }

  if (payload.birthDate) {
    payload.birthDate = dayjs(payload.birthDate).format('YYYY-MM-DD')
  } else {
    delete payload.birthDate
  }

  if (payload.monthlyFee !== undefined && payload.monthlyFee !== null && payload.monthlyFee !== '') {
    payload.monthlyFee = +payload.monthlyFee
    if (Number.isNaN(payload.monthlyFee)) delete payload.monthlyFee
  }

  if (payload.discountPercent !== undefined && payload.discountPercent !== null && payload.discountPercent !== '') {
    payload.discountPercent = Number(payload.discountPercent)
    if (Number.isNaN(payload.discountPercent)) {
      delete payload.discountPercent
    }
  }

  cleanOptionalFields(payload)
  payload.status = LeadStatus.NEW

  try {
    await transferLeadToStudent(props.formForEdit.id, {
      ...payload,
      discountPeriods: [],
    } as any)
    open.value = false
    emit('updateData')
  } catch (err: any) {
    const errors = err?.response?.data?.errors
    if (errors) {
      leadFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    transferring.value = false
  }
}
</script>
