<template>
  <v-dialog width="800" v-model="open">
    <Form @submit="submit" ref="studentForm">
      <v-card title="Create Student">
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <Field name="firstName" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.firstName"
                  label="firstName"
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
                  label="lastName"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="phone" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.phone"
                  label="phone"
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
                  label="Select a date"
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
              <Field name="referrerId" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  :items="students"
                  item-title="firstName"
                  item-value="id"
                  v-model="form.referrerId"
                  label="referrerId"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-select>
              </Field>
            </v-col>
            <v-col cols="6">
              <Field name="monthlyFee" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.monthlyFee"
                  label="monthlyFee"
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
                  :items="studyTimeOptions"
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
            <v-col cols="6">
              <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
                <v-select
                  :items="centers"
                  item-title="name"
                  item-value="id"
                  v-model="form.centerId"
                  label="centerId"
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
                  label="groupIds"
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

            <!-- Discount Section -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h3 class="mb-4">Chegirma</h3>
            </v-col>

            <v-col v-if="!usePeriodDiscounts" cols="12" md="6">
              <Field name="discountPercent" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model.number="form.discountPercent"
                  label="Chegirma foizi"
                  type="number"
                  variant="outlined"
                  density="compact"
                  suffix="%"
                  :min="0"
                  :max="100"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>

            <v-col v-if="!usePeriodDiscounts" cols="12" md="6">
              <Field name="discountReason" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-model="form.discountReason"
                  label="Chegirma sababi"
                  variant="outlined"
                  density="compact"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
            </v-col>

            <v-col cols="12">
              <v-checkbox
                v-model="usePeriodDiscounts"
                label="Periodlar bo'yicha chegirma qo'llash"
                density="compact"
              ></v-checkbox>
            </v-col>

            <v-col v-if="usePeriodDiscounts" cols="12">
              <div class="discount-periods">
                <div
                  v-for="(period, index) in form.discountPeriods"
                  :key="index"
                  class="discount-period-item mb-4 pa-4"
                  style="border: 1px solid rgba(0, 0, 0, 0.12); border-radius: 4px;"
                >
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h4 class="text-subtitle-1">Period {{ index + 1 }}</h4>
                    <v-btn
                      v-if="form.discountPeriods && form.discountPeriods.length > 1"
                      @click="removeDiscountPeriod(index)"
                      color="error"
                      icon="mdi-minus"
                      size="small"
                      variant="text"
                    ></v-btn>
                  </div>
                  <v-row dense>
                    <v-col cols="12" md="3">
                      <Field :name="`discountPeriods.${index}.percent`" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model.number="period.percent"
                          label="Foiz"
                          type="number"
                          variant="outlined"
                          density="compact"
                          suffix="%"
                          :min="0"
                          :max="100"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <Field :name="`discountPeriods.${index}.fromMonth`" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="period.fromMonth"
                          label="Boshlanish oyi"
                          type="month"
                          variant="outlined"
                          density="compact"
                          placeholder="YYYY-MM"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <Field :name="`discountPeriods.${index}.toMonth`" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="period.toMonth"
                          label="Tugash oyi"
                          type="month"
                          variant="outlined"
                          density="compact"
                          placeholder="YYYY-MM"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <Field :name="`discountPeriods.${index}.reason`" v-slot="{ handleChange, handleBlur, errors }">
                        <v-text-field
                          v-model="period.reason"
                          label="Sabab"
                          variant="outlined"
                          density="compact"
                          :error-messages="errors"
                          @update:model-value="handleChange"
                          @blur="handleBlur"
                        ></v-text-field>
                      </Field>
                    </v-col>
                  </v-row>
                </div>
                <v-btn
                  @click="addDiscountPeriod"
                  color="primary"
                  variant="outlined"
                  class="mt-2"
                >
                  Period qo'shish
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="open = false" text="Cancel"></v-btn>
          <v-btn color="primary" type="submit" :loading="loading" text="Save"></v-btn>
        </v-card-actions>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch, computed } from 'vue'
import { Form, Field } from 'vee-validate'
import type { StudentForm } from '@/types/students.types'
import type { Center } from '@/types/center.types'
import { fetchAllCenters } from '@/services/pages/centers'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchAllStudents, createStudent, updateStudent } from '@/services/pages/students'
import type { Student } from '@/types/students.types'
import { StudentStatus } from '@/types/students.enum'
import { WeekDay } from '@/types/groups.enum'
import dayjs from 'dayjs'

const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const students = ref<Student[]>([])
const open = defineModel('open')
const props = defineProps<Props>()
const loading = ref(false)
const studentForm = ref()

const form = ref<StudentForm>({
  firstName: '',
  lastName: '',
  phone: '',
  secondPhone: '',
  birthDate: '',

  referrerId: undefined,
  monthlyFee: undefined,
  comment: '',
  heardAboutUs: '',
  preferredTime: undefined,
  preferredDays: [],
  passportSeries: '',
  passportNumber: '',
  jshshir: '',
  status: StudentStatus.NEW,
  centerId: undefined,
  groupIds: [],
  discountPercent: undefined,
  discountReason: undefined,
  discountPeriods: [],
})

const usePeriodDiscounts = ref(false)
const identityTab = ref<'passport' | 'jshshir'>('passport')

interface Props {
  formForEdit?: Student
}
interface Emits {
  (e: 'updateData'): void
  (e: 'clearForm'): void
}
const emit = defineEmits<Emits>()
const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
  } catch (err) {
    console.log(err)
  }
}
getCenters()

watch(open, (newValue) => {
  if (newValue && props.formForEdit?.id) {
    form.value.firstName = props.formForEdit.firstName
    form.value.lastName = props.formForEdit.lastName
    form.value.phone = props.formForEdit.phone
    form.value.secondPhone = props.formForEdit.secondPhone || ''
    form.value.birthDate = props.formForEdit.birthDate
    form.value.referrerId = props.formForEdit.referrerId
    form.value.monthlyFee = props.formForEdit.monthlyFee
    form.value.comment = props.formForEdit.comment || ''
    form.value.heardAboutUs = props.formForEdit.heardAboutUs || ''
    form.value.preferredTime = props.formForEdit.preferredTime || undefined
    form.value.preferredDays = props.formForEdit.preferredDays || []
    form.value.passportSeries = props.formForEdit.passportSeries || ''
    form.value.passportNumber = props.formForEdit.passportNumber || ''
    form.value.jshshir = props.formForEdit.jshshir || ''
    if (form.value.jshshir && !form.value.passportSeries && !form.value.passportNumber) {
      identityTab.value = 'jshshir'
    } else {
      identityTab.value = 'passport'
    }
    form.value.centerId = props.formForEdit.centerId
    form.value.groupIds = props.formForEdit.groupIds || []
    if (form.value.centerId) {
      getGroups(form.value.centerId)
      getStudents(form.value.centerId)
    }

    // Load discount fields if they exist
    if ((props.formForEdit as any).discountPeriods && Array.isArray((props.formForEdit as any).discountPeriods) && (props.formForEdit as any).discountPeriods.length > 0) {
      form.value.discountPeriods = (props.formForEdit as any).discountPeriods.map((period: any) => ({
        ...period,
        // Convert YYYY-MM-DD to YYYY-MM format for month input
        fromMonth: period.fromMonth ? (period.fromMonth.length === 10 ? period.fromMonth.substring(0, 7) : period.fromMonth) : '',
        toMonth: period.toMonth ? (period.toMonth.length === 10 ? period.toMonth.substring(0, 7) : period.toMonth) : '',
      }))
      usePeriodDiscounts.value = true
    } else {
      form.value.discountPeriods = []
      usePeriodDiscounts.value = false
      if ((props.formForEdit as any).discountPercent !== undefined) {
        form.value.discountPercent = (props.formForEdit as any).discountPercent
      }
      if ((props.formForEdit as any).discountReason) {
        form.value.discountReason = (props.formForEdit as any).discountReason
      }
    }

    console.log(props.formForEdit)
  }
  if (!newValue) {
    emit('clearForm')
    form.value = {
      firstName: '',
      lastName: '',
      phone: '',
      secondPhone: '',
      birthDate: '',
      referrerId: undefined,
      monthlyFee: undefined,
      comment: '',
      heardAboutUs: '',
      preferredTime: undefined,
      preferredDays: [],
      passportSeries: '',
      passportNumber: '',
      jshshir: '',
      centerId: undefined,
      groupIds: [],
      discountPercent: undefined,
      discountReason: undefined,
      discountPeriods: [],
    }
    usePeriodDiscounts.value = false
    identityTab.value = 'passport'
    groups.value = []
    students.value = []
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

watch(usePeriodDiscounts, (newValue) => {
  if (newValue && (!form.value.discountPeriods || form.value.discountPeriods.length === 0)) {
    form.value.discountPeriods = [{
      percent: 0,
      fromMonth: '',
      toMonth: '',
      reason: '',
    }]
    // Clear discountPercent and discountReason when using period discounts
    form.value.discountPercent = undefined
    form.value.discountReason = undefined
  } else if (!newValue) {
    form.value.discountPeriods = []
  }
})

const getGroups = async (centerId?: number) => {
  try {
    const { data } = await fetchAllGroups(centerId)
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}

watch(() => form.value.centerId, (newCenterId, oldCenterId) => {
  if (newCenterId && newCenterId !== oldCenterId) {
    getGroups(newCenterId)
    getStudents(newCenterId)
    form.value.groupIds = []
    form.value.referrerId = undefined
  } else if (!newCenterId) {
    groups.value = []
    form.value.groupIds = []
    students.value = []
    form.value.referrerId = undefined
  }
})

const getStudents = async (centerId?: number) => {
  try {
    const { data } = await fetchAllStudents(centerId ? { centerId } : undefined)
    students.value = data
  } catch (err) {
    console.log(err)
  }
}

const studyTimeOptions = [
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

const addDiscountPeriod = () => {
  if (!form.value.discountPeriods) {
    form.value.discountPeriods = []
  }
  form.value.discountPeriods.push({
    percent: 0,
    fromMonth: '',
    toMonth: '',
    reason: '',
  })
}

const removeDiscountPeriod = (index: number) => {
  if (form.value.discountPeriods && form.value.discountPeriods.length > 1) {
    form.value.discountPeriods.splice(index, 1)
  } else {
    usePeriodDiscounts.value = false
  }
}

const submit = async () => {
  loading.value = true
  if (form.value.monthlyFee === undefined || form.value.monthlyFee === null || form.value.monthlyFee === '') {
    delete form.value.monthlyFee
  } else {
    form.value.monthlyFee = +form.value.monthlyFee
    if (Number.isNaN(form.value.monthlyFee)) {
      delete form.value.monthlyFee
    }
  }
  form.value.birthDate = dayjs(form.value.birthDate).format('YYYY-MM-DD')

  // Filter out incomplete periods and keep only required fields
  if (form.value.discountPeriods && form.value.discountPeriods.length > 0) {
    form.value.discountPeriods = form.value.discountPeriods
      .filter(period => period.fromMonth && period.toMonth)
      .map(period => ({
        percent: period.percent,
        fromMonth: period.fromMonth,
        toMonth: period.toMonth,
        reason: period.reason || '',
      }))
  }

  // Clean up discount fields if not used
  if (usePeriodDiscounts.value && form.value.discountPeriods && form.value.discountPeriods.length > 0) {
    // When using period discounts, remove discountPercent and discountReason
    delete form.value.discountPercent
    delete form.value.discountReason
  } else {
    // When not using period discounts, check if discountPercent exists and is not 0
    const discountPercent = form.value.discountPercent
    if (discountPercent === undefined || discountPercent === null || discountPercent === '' || discountPercent === 0 || discountPercent === '0') {
      delete form.value.discountPercent
      delete form.value.discountReason
    } else {
      // If discountPercent exists but discountReason is empty, remove it
      if (!form.value.discountReason) {
        delete form.value.discountReason
      }
    }
    // Set discountPeriods to empty array if not using period discounts
    form.value.discountPeriods = []
  }

  const optionalStringFields: (keyof StudentForm)[] = [
    'secondPhone',
    'comment',
    'heardAboutUs',
    'preferredTime',
    'passportSeries',
    'passportNumber',
    'jshshir',
  ]

  optionalStringFields.forEach((field) => {
    const value = form.value[field]
    if (value === undefined || value === null || value === '') {
      delete form.value[field]
    }
  })

  if (!form.value.preferredDays || form.value.preferredDays.length === 0) {
    delete form.value.preferredDays
  }

  try {
    if (props.formForEdit?.id) {
      delete form.value.status
      await updateStudent(form.value, props.formForEdit.id)
    } else {
      await createStudent(form.value)
    }
    open.value = false
    emit('updateData')
  } catch (err) {
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      studentForm.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>
