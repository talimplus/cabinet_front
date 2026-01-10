<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      Subjects
      <v-btn color="primary" @click="openModal = true">Create</v-btn>
    </v-card-title>

    <v-row class="px-4">
      <v-col cols="3">
        <v-select
          label="Centers"
          density="compact"
          clearable
          :items="centers"
          variant="outlined"
          item-title="name"
          item-value="id"
          v-model="params.centerId"
          @update:modelValue="getSubjects"
        ></v-select> </v-col
      ><v-col cols="3">
        <v-text-field
          variant="outlined"
          v-model="params.name"
          label="Subject Name"
          density="compact"
          @input="getSubjects"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-data-table :headers="headers" :items="items" hide-default-footer>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            variant="text"
            @click="edit(item)"
          ></v-btn>
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
            @click="remove(item.id)"
          ></v-btn>
        </div>
      </template>
    </v-data-table>
    <v-pagination :length="totalPages" v-model="params.page"></v-pagination>
    <CreateSubjects
      v-model:open="openModal"
      @updateData="getSubjects"
      @clearForm="clearFormForEdit"
      :centers="centers"
      :formForEdit="formForEdit"
    >
    </CreateSubjects>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { fetchSubjects, deleteSubject } from '@/services/pages/subjects'
import type { Subject, SubjectsParams } from '@/types/subject.types'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'
import CreateSubjects from '@/components/pages/subjects/CreateSubject.vue'

const items = ref<Subject[]>([])
const centers = ref<Center[]>([])
const openModal = ref(false)
const totalPages = ref(0)
const formForEdit = ref<Subject>()

const params = ref<SubjectsParams>({
  page: 1,
  perPage: 10,
  centerId: undefined,
})

const edit = (subject: Subject) => {
  formForEdit.value = subject
  openModal.value = true
}

const clearFormForEdit = () => {
  formForEdit.value = undefined
}
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Center Name', key: 'center.name' },
  { title: 'Subject Name', key: 'name' },
  { title: 'Actions', key: 'actions' },
]

const remove = async (id: number) => {
  try {
    await deleteSubject(id)
    getSubjects()
  } catch (err) {
    console.log(err)
  }
}

const getSubjects = async () => {
  try {
    const {
      data: { data, meta },
    } = await fetchSubjects(params.value)
    items.value = data
    totalPages.value = meta.totalPages
  } catch (err) {
    console.log(err)
  }
}

const getCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !params.value.centerId) {
      const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
      params.value.centerId = defaultCenter.id
    }
  } catch (err) {
    console.log(err)
  }
}

onMounted(async () => {
  await getCenters()
  if (params.value.centerId) {
    await getSubjects()
  }
})

watch(
  () => params.value.page,
  () => {
    getSubjects()
  }
)
</script>

<style scoped>
h1 {
  color: red;
}
</style>