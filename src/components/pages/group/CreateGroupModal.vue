<template>
  <v-dialog v-model="open" width="750">
    <form @submit.prevent="submit">
      <v-card>
        <v-card-text class="pb-1">
          <v-text-field v-model="form.name" label="Group Name"></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-select
            v-model="form.centerId"
            :items="centers"
            label="Centers"
            item-title="name"
            item-value="id"
            @update:modelValue="changedCenter"
          ></v-select>
        </v-card-text>
        <v-card-text class="pt-0">
          <v-select
            v-model="form.subjectId"
            :items="subjects"
            label="Subjects"
            :disabled="!form.centerId"
            item-title="name"
            item-value="id"
          ></v-select>
        </v-card-text>

        <v-card-text class="pt-0">
          <v-select
            v-model="form.roomId"
            :items="rooms"
            label="Rooms"
            :disabled="!form.centerId"
            item-title="name"
            item-value="id"
          ></v-select>
        </v-card-text>

        <v-card-text class="pt-0">
          <v-select
            v-model="form.teacherId"
            :items="users"
            :disabled="!form.centerId"
            label="Teacher"
            item-title="fullName"
            item-value="id"
          ></v-select>
        </v-card-text>
        <v-card-text class="pb-0">
          <v-text-field v-model="form.monthlyFee" label="MonthlyFee"></v-text-field>
        </v-card-text>
        <v-card-text>
          <v-row>
            <v-col :cols="6">
              <v-autocomplete
                placeholder="Select Lesson Days"
                :items="dayList"
                multiple
                chips
                v-model="days"
              />
            </v-col>
            <v-col :cols="6" class="d-flex align-center">
              <v-text-field
                v-if="!differentTime"
                placeholder="Group Name"
                type="time"
                v-model="allTimes"
              ></v-text-field>
              <v-checkbox label="Alohida tanlash" v-model="differentTime" />
            </v-col>
            <template v-if="differentTime">
              <v-col :cols="6" v-for="(day, i) in days" :key="`day-${i}`">
                <v-text-field :label="day" type="time" v-model="times[i]" />
              </v-col>
            </template>
          </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-btn @click="open = false">Cancel</v-btn>
          <v-btn type="submit" color="primary" text="Submit"></v-btn>
        </template>
      </v-card>
    </form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, defineModel, ref, defineProps, defineEmits, watch } from 'vue'
import { WeekDay } from '@/types/groups.enum'
import { fetchSubjects } from '@/services/pages/subjects'
import { fetchUsers } from '@/services/pages/users'
import { createGroup, fetchAllGroups, updateGroup } from '@/services/pages/groups'
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
const form = ref<GroupForm>({
  name: '',
  subjectId: undefined,
  teacherId: undefined,
  roomId: undefined,
  monthlyFee: undefined,
  days: [],
  centerId: '',
})

watch(open, (newValue: boolean) => {
  console.log(props.formForEdit)
  if (newValue && props.formForEdit?.id) {
    form.value.name = props.formForEdit?.name
    form.value.centerId = props.formForEdit?.center?.id
    form.value.subjectId = props.formForEdit?.subject?.id
    form.value.roomId = props.formForEdit?.room?.id
    form.value.teacherId = props.formForEdit?.teacher?.id
    form.value.monthlyFee = props.formForEdit?.monthlyFee
    form.value.days = props.formForEdit?.schedules
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
      days: [],
      centerId: '',
    }
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
  form.value.monthlyFee = +form.value.monthlyFee
  form.value.days = []
  days.value.forEach((p, i) => {
    form.value.days.push({
      day: p,
      startTime: differentTime.value ? times.value[i] : allTimes.value,
    })
  })
  try {
    if (props.formForEdit?.id) {
      await updateGroup(form.value, props.formForEdit.id)
    } else {
      await createGroup(form.value)
    }
    open.value = false
    emits('updateData')
  } catch (err) {
    console.log(err)
  }
}
</script>

<style scoped>
</style>