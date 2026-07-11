<template>
  <v-card>
    <v-card-title class="mb-6 d-flex justify-space-between">
      {{ $t('syllabuses.title') }}
      <div v-if="canManageSyllabus" class="d-flex" style="gap: 8px">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-creation" @click="openAiModal = true">
          {{ $t('syllabuses.aiChat.button') }}
        </v-btn>
        <v-btn color="primary" @click="openModal = true">
          {{ $t('common.create') }}
        </v-btn>
      </div>
    </v-card-title>

    <v-row class="px-4">
      <v-col cols="12" md="3">
        <v-select
          :label="$t('syllabuses.filter.subject')"
          density="compact"
          clearable
          :items="subjects"
          variant="outlined"
          item-title="name"
          item-value="id"
          v-model="params.subjectId"
          @update:modelValue="onFilterChange"
        ></v-select>
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          variant="outlined"
          v-model="params.name"
          :label="$t('syllabuses.filter.name')"
          density="compact"
          clearable
          @input="onFilterChange"
          @click:clear="onFilterChange"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card-text>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        hide-default-footer
        :items-per-page="params.perPage"
        :no-data-text="$t('syllabuses.empty')"
      >
        <template v-slot:item.name="{ item }">
          <router-link :to="`/syllabuses/${item.id}`" class="syllabus-link">
            {{ item.name }}
          </router-link>
        </template>
        <template v-slot:item.topicsCount="{ item }">
          <v-chip size="small" variant="tonal" color="primary">{{ item.topicsCount }}</v-chip>
        </template>
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              density="compact"
              color="medium-emphasis"
              :icon="canManageSyllabus ? 'mdi-pencil' : 'mdi-eye'"
              size="small"
              class="me-2"
              variant="text"
              :to="`/syllabuses/${item.id}`"
            ></v-btn>
            <v-btn
              v-if="canManageSyllabus"
              density="compact"
              color="medium-emphasis"
              icon="mdi-delete"
              size="small"
              variant="text"
              @click="askDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
      <v-pagination :length="totalPages" v-model="params.page" class="mt-4"></v-pagination>
    </v-card-text>

    <CreateSyllabusModal v-model:open="openModal" :subjects="subjects" @updateData="getSyllabuses" />

    <AiSyllabusModal
      v-model:open="openAiModal"
      :subjects="subjects"
      @updateData="getSyllabuses"
      @created="onAiCreated"
    />

    <!-- Delete confirmation -->
    <v-dialog v-model="deleteDialog.show" max-width="440">
      <v-card :title="$t('syllabuses.deleteConfirm.title')">
        <v-card-text>
          {{ $t('syllabuses.deleteConfirm.text', { name: deleteDialog.item?.name }) }}
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteDialog.show = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="deleteDialog.loading"
            @click="confirmDelete"
          >
            {{ $t('common.delete') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchSyllabuses, deleteSyllabus } from '@/services/pages/syllabuses'
import { fetchAllSubjects } from '@/services/pages/subjects'
import type { SyllabusListItem, SyllabusesParams } from '@/types/syllabus.types'
import type { Subject } from '@/types/subject.types'
import CreateSyllabusModal from '@/components/pages/syllabus/CreateSyllabusModal.vue'
import AiSyllabusModal from '@/components/pages/syllabus/AiSyllabusModal.vue'
import { usePermissions } from '@/composables/usePermissions'

defineOptions({ name: 'SyllabusesList' })

const { t } = useI18n()
const { canManageSyllabus } = usePermissions()

const items = ref<SyllabusListItem[]>([])
const subjects = ref<Subject[]>([])
const openModal = ref(false)
const openAiModal = ref(false)
const totalPages = ref(0)
const loading = ref(false)

const params = ref<SyllabusesParams>({
  page: 1,
  perPage: 10,
  subjectId: undefined,
  name: undefined,
})

const deleteDialog = ref<{ show: boolean; loading: boolean; item: SyllabusListItem | null }>({
  show: false,
  loading: false,
  item: null,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const headers = [
  { title: t('syllabuses.table.id'), key: 'id' },
  { title: t('syllabuses.table.name'), key: 'name' },
  { title: t('syllabuses.table.subject'), key: 'subject.name' },
  { title: t('syllabuses.table.topicsCount'), key: 'topicsCount' },
  { title: t('syllabuses.table.createdAt'), key: 'createdAt' },
  { title: t('common.actions'), key: 'actions', sortable: false },
]

const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const getSyllabuses = async () => {
  loading.value = true
  try {
    const {
      data: { data, meta },
    } = await fetchSyllabuses({
      ...params.value,
      name: params.value.name?.trim() || undefined,
    })
    items.value = data
    totalPages.value = meta.totalPages
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => {
  params.value.page = 1
  getSyllabuses()
}

const getSubjects = async () => {
  try {
    const { data } = await fetchAllSubjects()
    subjects.value = data
  } catch (err) {
    console.log(err)
  }
}

const onAiCreated = (message: string) => {
  snackbar.value = { show: true, message, color: 'success' }
}

const askDelete = (item: SyllabusListItem) => {
  deleteDialog.value = { show: true, loading: false, item }
}

const confirmDelete = async () => {
  const item = deleteDialog.value.item
  if (!item) return
  deleteDialog.value.loading = true
  try {
    await deleteSyllabus(item.id)
    deleteDialog.value.show = false
    snackbar.value = { show: true, message: t('common.success'), color: 'success' }
    getSyllabuses()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    deleteDialog.value.loading = false
  }
}

onMounted(() => {
  getSubjects()
  getSyllabuses()
})

watch(
  () => params.value.page,
  () => {
    getSyllabuses()
  },
)
</script>

<style scoped>
.syllabus-link {
  color: rgb(1, 192, 200);
  text-decoration: none;
  font-weight: 500;
}

.syllabus-link:hover {
  text-decoration: underline;
}
</style>
