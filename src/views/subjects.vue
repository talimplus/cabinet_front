<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      {{ $t('subjects.title') }}
      <v-btn v-if="canManageSubjects" color="primary" @click="openModal = true">{{ $t('common.create') }}</v-btn>
    </v-card-title>

    <v-row class="px-4">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          variant="outlined"
          v-model="params.name"
          :label="$t('subjects.subjectName')"
          density="compact"
          @input="getSubjects"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-card-text>
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
            v-if="canManageSubjects"
            @click="edit(item)"
          ></v-btn>
          <v-btn
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
            v-if="canManageSubjects"
            @click="remove(item.id)"
          ></v-btn>
        </div>
      </template>
      </v-data-table>
      <v-pagination :length="totalPages" v-model="params.page" class="mt-4"></v-pagination>
    </v-card-text>
    <CreateSubjects
      v-model:open="openModal"
      @updateData="getSubjects"
      @clearForm="clearFormForEdit"
      :formForEdit="formForEdit"
    >
    </CreateSubjects>
  </v-card>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchSubjects, deleteSubject } from '@/services/pages/subjects'
import type { Subject, SubjectsParams } from '@/types/subject.types'
import CreateSubjects from '@/components/pages/subjects/CreateSubject.vue'

const { canManageSubjects } = usePermissions()

const { t } = useI18n()

const items = ref<Subject[]>([])
const openModal = ref(false)
const totalPages = ref(0)
const formForEdit = ref<Subject>()

const params = ref<SubjectsParams>({
  page: 1,
  perPage: 10,
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
  { title: t('subjects.centerName'), key: 'center.name' },
  { title: t('subjects.subjectName'), key: 'name' },
  { title: t('common.actions'), key: 'actions' },
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

onMounted(async () => {
  await getSubjects()
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