<template>
  <v-dialog v-model="open" width="750">
    <Form @submit="submit" ref="groupFormRef">
      <v-card>
        <v-card-text class="pb-1">
          <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              label="Group Name"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text>
          <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.centerId"
              :items="centers"
              label="Centers"
              item-title="name"
              item-value="id"
              @update:modelValue="changedCenter"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>
        <v-card-text class="pt-0">
          <Field name="subjectId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.subjectId"
              :items="subjects"
              label="Subjects"
              :disabled="!form.centerId"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>

        <v-card-text class="pt-0">
          <Field name="roomId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.roomId"
              :items="rooms"
              label="Rooms"
              :disabled="!form.centerId"
              item-title="name"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>

        <v-card-text class="pt-0">
          <Field name="teacherId" v-slot="{ handleChange, handleBlur, errors }">
            <v-select
              v-model="form.teacherId"
              :items="users"
              :disabled="!form.centerId"
              label="Teacher"
              item-title="fullName"
              item-value="id"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-select>
          </Field>
        </v-card-text>
        <v-card-text class="pb-0">
          <Field name="monthlyFee" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.monthlyFee"
              label="Oylik to'lov"
              type="number"
              variant="outlined"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text class="pt-0">
          <Field name="durationMonths" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.durationMonths"
              label="Dars necha oy davom etishi"
              type="number"
              variant="outlined"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col :cols="6">
              <Field name="days" v-slot="{ handleChange, handleBlur, errors }">
                <v-autocomplete
                  placeholder="Select Lesson Days"
                  :items="dayList"
                  multiple
                  chips
                  v-model="days"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </v-col>
            <v-col :cols="6" class="d-flex align-center">
              <Field name="allTimes" v-slot="{ handleChange, handleBlur, errors }">
                <v-text-field
                  v-if="!differentTime"
                  placeholder="Group Name"
                  type="time"
                  v-model="allTimes"
                  :error-messages="errors"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                ></v-text-field>
              </Field>
              <Field name="differentTime" v-slot="{ handleChange, handleBlur }">
                <v-checkbox
                  label="Alohida tanlash"
                  v-model="differentTime"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                />
              </Field>
            </v-col>
            <template v-if="differentTime">
              <v-col :cols="6" v-for="(day, i) in days" :key="`day-${i}`">
                <Field :name="`times.${i}`" v-slot="{ handleChange, handleBlur, errors }">
                  <v-text-field
                    :label="day"
                    type="time"
                    v-model="times[i]"
                    :error-messages="errors"
                    @update:model-value="handleChange"
                    @blur="handleBlur"
                  />
                </Field>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">Cancel</v-btn>
          <v-btn type="submit" color="primary" text="Submit" :loading="loading" :disabled="loading"></v-btn>
        </template>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, defineModel, ref, defineProps, defineEmits, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { WeekDay } from '@/types/groups.enum'
import { fetchSubjects } from '@/services/pages/subjects'
import { fetchUsers } from '@/services/pages/users'
import { createGroup, updateGroup } from '@/services/pages/groups'
import { fetchRooms } from '@/services/pages/rooms'
import type { GroupFormDays, GroupForm } from '@/types/groups.types'
import type { Center } from '@/types/center.types'
import type { User } from '@/types/users.types'
import type { Subject } from '@/types/subject.types'
import type { Room } from '@/types/room.types'
import type { Group } from '@/types/groups.types'

const subjects = ref<Subject[]>([])
const users = ref<User[]>([])
const rooms = ref<Room[]>([])

interface Props {
  centers: Center[]
  formForEdit?: Group
}

interface Emits {
  (e: 'updateData'): void
  (e: 'clearEditForm'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const open = defineModel('open', { type: Boolean })
const differentTime = ref(false)
const loading = ref(false)
const groupFormRef = ref()
const form = ref<GroupForm>({
  name: '',
  subjectId: undefined,
  teacherId: undefined,
  roomId: undefined,
  monthlyFee: undefined,
  durationMonths: undefined,
  days: [],
  centerId: '',
})

watch(open, (newValue: boolean) => {
  console.log(props.formForEdit)
  if (newValue && props.formForEdit?.id) {
    form.value.name = props.formForEdit?.name || ''
    form.value.centerId = props.formForEdit?.center?.id
    form.value.subjectId = props.formForEdit?.subject?.id
    form.value.roomId = props.formForEdit?.room?.id
    form.value.teacherId = props.formForEdit?.teacher?.id
    form.value.monthlyFee = props.formForEdit?.monthlyFee ?? undefined
    form.value.durationMonths = props.formForEdit?.durationMonths ?? undefined

    // Convert schedules to days format
    if (props.formForEdit?.schedules && props.formForEdit.schedules.length > 0) {
      days.value = props.formForEdit.schedules.map((schedule) => schedule.day)
      if (props.formForEdit.schedules.length === 1) {
        allTimes.value = props.formForEdit.schedules[0].startTime
        differentTime.value = false
      } else {
        differentTime.value = true
        times.value = props.formForEdit.schedules.map((schedule) => schedule.startTime)
      }
    } else {
      days.value = []
      allTimes.value = ''
      times.value = []
      differentTime.value = false
    }

    getSubjects()
    getUsers()
    getRooms()
  } else {
    emits('clearEditForm')
    form.value = {
      name: '',
      subjectId: undefined,
      teacherId: undefined,
      roomId: undefined,
      monthlyFee: undefined,
      durationMonths: undefined,
      days: [],
      centerId: '',
    }
    days.value = []
    allTimes.value = ''
    times.value = []
    differentTime.value = false
  }
})

const times = ref([])
const days = ref<GroupFormDays[]>([])
const allTimes = ref('')
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

const getUsers = async () => {
  try {
    const {
      data: { data },
    } = await fetchUsers({ centerId: form.value.centerId })
    users.value = data.map((item) => {
      item.fullName = item.firstName + ' ' + item.lastName
      return item
    })
  } catch (err) {
    console.log(err)
  }
}

const getSubjects = async () => {
  try {
    const {
      data: { data },
    } = await fetchSubjects({
      centerId: form.value.centerId,
    })
    subjects.value = data
  } catch (err) {
    console.log(err)
  }
}

const getRooms = async () => {
  try {
    const {
      data: { data },
    } = await fetchRooms({ centerId: form.value.centerId })

    rooms.value = data
  } catch (err) {
    console.log(err)
  }
}

function changedCenter() {
  form.value.subjectId = undefined
  form.value.teacherId = undefined
  form.value.roomId = undefined

  getSubjects()
  getUsers()
  getRooms()
}

const submit = async () => {
  // Prepare form data
  // Handle monthlyFee: if it's a valid number (including 0), use it; otherwise send null

  const submitData: GroupForm = {
    name: form.value.name,
    centerId: form.value.centerId,
    subjectId: form.value.subjectId,
    teacherId: form.value.teacherId,
    roomId: form.value.roomId,
    monthlyFee: form.value.monthlyFee !== undefined && form.value.monthlyFee !== null && form.value.monthlyFee !== ''
      ? +form.value.monthlyFee
      : null,
    durationMonths: form.value.durationMonths !== undefined && form.value.durationMonths !== null && form.value.durationMonths !== ''
      ? +form.value.durationMonths
      : null,
    days: [],
  }

  // Convert days and times to days array
  days.value.forEach((day, i) => {
    if (day) {
      submitData.days?.push({
        day: day,
        startTime: differentTime.value ? (times.value[i] || '') : allTimes.value,
      })
    }
  })

  // Remove empty days array if no days selected
  if (submitData.days && submitData.days.length === 0) {
    delete submitData.days
  }

  if (submitData.durationMonths === null || Number.isNaN(submitData.durationMonths)) {
    delete submitData.durationMonths
  }

  try {
    loading.value = true
    if (props.formForEdit?.id) {
      await updateGroup(submitData, props.formForEdit.id)
    } else {
      await createGroup(submitData)
    }
    open.value = false
    emits('updateData')
  } catch (err) {
    const errors = (err as any)?.response?.data?.errors
    if (errors) {
      groupFormRef.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
