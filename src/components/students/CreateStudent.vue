<template>
  <v-dialog width="800" v-model="open">
    <form @submit.prevent="submit">
      <v-card title="Create Student">
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <v-text-field v-model="form.firstName" label="firstName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.lastName" label="lastName"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.phone" label="phone"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-date-input
                label="Select a date"
                prepend-icon=""
                prepend-inner-icon="$calendar"
                v-model="form.birthDate"
              ></v-date-input>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="students"
                item-title="firstName"
                item-value="id"
                v-model="form.referrerId"
                label="referrerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.monthlyFee" label="monthlyFee"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="centers"
                item-title="name"
                item-value="id"
                v-model="form.centerId"
                label="centerId"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-select
                :items="groups"
                item-title="name"
                item-value="id"
                multiple
                v-model="form.groupIds"
                label="groupIds"
              ></v-select>
            </v-col>

            <!-- Discount Section -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h3 class="mb-4">Chegirma</h3>
            </v-col>

            <v-col v-if="!usePeriodDiscounts" cols="12" md="6">
              <v-text-field
                v-model.number="form.discountPercent"
                label="Chegirma foizi"
                type="number"
                variant="outlined"
                density="compact"
                suffix="%"
                :min="0"
                :max="100"
              ></v-text-field>
            </v-col>

            <v-col v-if="!usePeriodDiscounts" cols="12" md="6">
              <v-text-field
                v-model="form.discountReason"
                label="Chegirma sababi"
                variant="outlined"
                density="compact"
              ></v-text-field>
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
                      <v-text-field
                        v-model.number="period.percent"
                        label="Foiz"
                        type="number"
                        variant="outlined"
                        density="compact"
                        suffix="%"
                        :min="0"
                        :max="100"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="period.fromMonth"
                        label="Boshlanish oyi"
                        type="month"
                        variant="outlined"
                        density="compact"
                        placeholder="YYYY-MM"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="period.toMonth"
                        label="Tugash oyi"
                        type="month"
                        variant="outlined"
                        density="compact"
                        placeholder="YYYY-MM"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-text-field
                        v-model="period.reason"
                        label="Sabab"
                        variant="outlined"
                        density="compact"
                      ></v-text-field>
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
    </form>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineModel, defineEmits, watch } from 'vue'
import type { StudentForm, DiscountPeriod } from '@/types/students.types'
import type { Center } from '@/types/center.types'
import { fetchAllCenters } from '@/services/pages/centers'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchAllStudents, createStudent, updateStudent } from '@/services/pages/students'
import type { Student } from '@/types/students.types'
import { StudentStatus } from '@/types/students.enum'
import dayjs from 'dayjs'

const centers = ref<Center[]>([])
const groups = ref<Group[]>([])
const students = ref<Student[]>([])
const open = defineModel('open')
const props = defineProps<Props>()
const loading = ref(false)

const form = ref<StudentForm>({
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: '',

  referrerId: undefined,
  monthlyFee: undefined,
  status: StudentStatus.NEW,
  centerId: undefined,
  groupIds: [],
  discountPercent: undefined,
  discountReason: undefined,
  discountPeriods: [],
})

const usePeriodDiscounts = ref(false)

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
    form.value.birthDate = props.formForEdit.birthDate
    form.value.referrerId = props.formForEdit.referrerId
    form.value.monthlyFee = props.formForEdit.monthlyFee
    form.value.centerId = props.formForEdit.centerId
    form.value.groupIds = props.formForEdit.groupIds || []

    // Load discount fields if they exist
    if ((props.formForEdit as any).discountPeriods && Array.isArray((props.formForEdit as any).discountPeriods) && (props.formForEdit as any).discountPeriods.length > 0) {
      form.value.discountPeriods = (props.formForEdit as any).discountPeriods.map((period: any) => ({
        ...period,
        // Keep YYYY-MM format as is
        fromMonth: period.fromMonth || '',
        toMonth: period.toMonth || '',
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
      birthDate: '',
      referrerId: undefined,
      monthlyFee: undefined,
      centerId: undefined,
      groupIds: [],
      discountPercent: undefined,
      discountReason: undefined,
      discountPeriods: [],
    }
    usePeriodDiscounts.value = false
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

const getGroups = async () => {
  try {
    const { data } = await fetchAllGroups()
    groups.value = data
  } catch (err) {
    console.log(err)
  }
}
getGroups()

const getStudents = async () => {
  try {
    const { data } = await fetchAllStudents()
    students.value = data
  } catch (err) {
    console.log(err)
  }
}
getStudents()

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
  form.value.monthlyFee = +form.value.monthlyFee
  form.value.birthDate = dayjs(form.value.birthDate).format('YYYY-MM-DD')

  // Filter out incomplete periods (fromMonth and toMonth are already in YYYY-MM format)
  if (form.value.discountPeriods && form.value.discountPeriods.length > 0) {
    form.value.discountPeriods = form.value.discountPeriods.filter(period => period.fromMonth && period.toMonth)
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
    // Remove discountPeriods if not using period discounts
    delete form.value.discountPeriods
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
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>
