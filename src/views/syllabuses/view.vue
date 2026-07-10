<template>
  <v-container fluid class="pa-0">
    <div v-if="loading" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else-if="syllabus">
      <!-- Header -->
      <v-card class="mb-4">
        <v-card-text class="d-flex align-center flex-wrap" style="gap: 12px">
          <v-btn icon="mdi-arrow-left" variant="text" size="small" to="/syllabuses"></v-btn>
          <div class="flex-grow-1">
            <div class="text-h5">{{ syllabus.name }}</div>
            <div v-if="syllabus.description" class="text-body-2 text-medium-emphasis mt-1">
              {{ syllabus.description }}
            </div>
          </div>
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-book-open-variant">
            {{ syllabus.subject?.name }}
          </v-chip>
        </v-card-text>
      </v-card>

      <!-- Topics -->
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between flex-wrap">
          <span>
            {{ $t('syllabuses.editor.topics') }}
            <span class="text-medium-emphasis text-body-1">({{ topics.length }})</span>
          </span>
          <v-btn
            v-if="canManageSyllabus"
            color="primary"
            prepend-icon="mdi-plus"
            @click="openAddDialog"
          >
            {{ $t('syllabuses.editor.addTopic') }}
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div v-if="topics.length === 0" class="text-center pa-8 text-medium-emphasis">
            {{ $t('syllabuses.editor.noTopics') }}
          </div>

          <template v-else>
            <div v-if="canManageSyllabus" class="text-caption text-medium-emphasis mb-3">
              <v-icon size="14" icon="mdi-drag" class="me-1"></v-icon>
              {{ $t('syllabuses.editor.dragHint') }}
            </div>

            <div class="topics-list">
              <div
                v-for="(topic, index) in topics"
                :key="topic.id"
                class="topic-card"
                :class="{
                  dragging: dragIndex === index,
                  'drag-over': dragOverIndex === index && dragIndex !== index,
                }"
                :draggable="canManageSyllabus"
                @dragstart="canManageSyllabus && onDragStart(index, $event)"
                @dragover.prevent="canManageSyllabus && onDragOver(index)"
                @dragleave="canManageSyllabus && onDragLeave(index)"
                @drop.prevent="canManageSyllabus && onDrop(index)"
                @dragend="onDragEnd"
                @click="openEditor(topic)"
              >
                <v-icon
                  v-if="canManageSyllabus"
                  icon="mdi-drag"
                  class="drag-handle"
                  @click.stop
                ></v-icon>
                <div class="topic-order">{{ index + 1 }}</div>
                <div class="topic-main">
                  <div class="topic-title">{{ topic.title }}</div>
                  <div v-if="topic.description" class="topic-description text-truncate">
                    {{ topic.description }}
                  </div>
                </div>
                <div class="topic-meta">
                  <v-chip
                    v-if="topic.difficulty"
                    :color="difficultyColor(topic.difficulty)"
                    size="small"
                    variant="tonal"
                  >
                    {{ $t(`syllabuses.difficulty.${topic.difficulty}`) }}
                  </v-chip>
                  <v-chip v-if="topic.estimatedLessons" size="small" variant="outlined">
                    {{ $t('syllabuses.editor.estimatedLessons', { n: topic.estimatedLessons }) }}
                  </v-chip>
                  <div class="content-indicators">
                    <v-tooltip
                      v-for="key in contentKeys"
                      :key="key"
                      :text="`${$t(`syllabuses.content.${key}`)}: ${
                        topic[key]?.trim()
                          ? $t('syllabuses.content.filled')
                          : $t('syllabuses.content.notFilled')
                      }`"
                      location="top"
                    >
                      <template v-slot:activator="{ props: tooltipProps }">
                        <v-icon
                          v-bind="tooltipProps"
                          size="16"
                          :icon="contentIcon(key)"
                          :color="topic[key]?.trim() ? 'success' : 'grey-lighten-1'"
                        ></v-icon>
                      </template>
                    </v-tooltip>
                  </div>
                </div>
                <v-btn
                  :icon="canManageSyllabus ? 'mdi-pencil' : 'mdi-eye'"
                  variant="text"
                  size="small"
                  color="medium-emphasis"
                  @click.stop="openEditor(topic)"
                ></v-btn>
              </div>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </template>

    <!-- Add topic dialog -->
    <v-dialog v-model="addDialog.show" max-width="480">
      <v-card :title="$t('syllabuses.editor.addTopic')">
        <v-card-text>
          <v-text-field
            v-model="addDialog.form.title"
            :label="$t('syllabuses.editor.topicTitle')"
            class="mb-3"
          ></v-text-field>
          <v-textarea
            v-model="addDialog.form.description"
            :label="$t('syllabuses.editor.topicDescription')"
            rows="2"
            class="mb-3"
          ></v-textarea>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-select
                v-model="addDialog.form.difficulty"
                :items="difficultyItems"
                :label="$t('syllabuses.editor.difficulty')"
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="addDialog.form.estimatedLessons"
                :label="$t('syllabuses.editor.estimatedLessonsLabel')"
                type="number"
                min="1"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="addDialog.show = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="addDialog.loading"
            :disabled="!addDialog.form.title?.trim()"
            @click="submitAddTopic"
          >
            {{ $t('common.add') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- Topic editor drawer -->
    <TopicEditorDrawer
      v-model:open="editorOpen"
      :syllabus-id="syllabusId"
      :topic="selectedTopic"
      :readonly="!canManageSyllabus"
      @saved="loadSyllabus"
      @deleted="loadSyllabus"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  fetchSyllabusById,
  createTopic,
  reorderTopics,
} from '@/services/pages/syllabuses'
import type { Syllabus, SyllabusTopic, TopicDifficulty } from '@/types/syllabus.types'
import TopicEditorDrawer from '@/components/pages/syllabus/TopicEditorDrawer.vue'
import { usePermissions } from '@/composables/usePermissions'

defineOptions({ name: 'SyllabusView' })

const route = useRoute()
const { t } = useI18n()
const { canManageSyllabus } = usePermissions()

const syllabusId = computed(() => String(route.params.id))
const syllabus = ref<Syllabus | null>(null)
const topics = ref<SyllabusTopic[]>([])
const loading = ref(false)

const editorOpen = ref(false)
const selectedTopic = ref<SyllabusTopic | null>(null)

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

const contentKeys = ['guide', 'lessonOutline', 'homework'] as const

const addDialog = ref({
  show: false,
  loading: false,
  form: {
    title: '',
    description: '',
    difficulty: null as TopicDifficulty | null,
    estimatedLessons: null as number | null,
  },
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const difficultyItems = computed(() => [
  { title: t('syllabuses.difficulty.easy'), value: 'easy' },
  { title: t('syllabuses.difficulty.medium'), value: 'medium' },
  { title: t('syllabuses.difficulty.hard'), value: 'hard' },
])

const difficultyColor = (difficulty: TopicDifficulty): string => {
  switch (difficulty) {
    case 'easy':
      return 'success'
    case 'medium':
      return 'warning'
    case 'hard':
      return 'error'
    default:
      return 'grey'
  }
}

const contentIcon = (key: (typeof contentKeys)[number]): string => {
  switch (key) {
    case 'guide':
      return 'mdi-book-open-page-variant-outline'
    case 'lessonOutline':
      return 'mdi-format-list-bulleted'
    case 'homework':
      return 'mdi-home-edit-outline'
  }
  return 'mdi-circle-outline'
}

const loadSyllabus = async () => {
  loading.value = !syllabus.value
  try {
    const data = await fetchSyllabusById(syllabusId.value)
    syllabus.value = data
    topics.value = [...(data.topics || [])].sort((a, b) => a.orderIndex - b.orderIndex)
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

const openEditor = (topic: SyllabusTopic) => {
  selectedTopic.value = topic
  editorOpen.value = true
}

const openAddDialog = () => {
  addDialog.value = {
    show: true,
    loading: false,
    form: { title: '', description: '', difficulty: null, estimatedLessons: null },
  }
}

const submitAddTopic = async () => {
  const form = addDialog.value.form
  if (!form.title.trim()) return
  addDialog.value.loading = true
  try {
    await createTopic(syllabusId.value, {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      difficulty: form.difficulty || undefined,
      estimatedLessons: form.estimatedLessons || undefined,
    })
    addDialog.value.show = false
    await loadSyllabus()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    addDialog.value.loading = false
  }
}

// --- Drag & drop reorder -------------------------------------------------
const onDragStart = (index: number, event: DragEvent) => {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const onDragOver = (index: number) => {
  dragOverIndex.value = index
}

const onDragLeave = (index: number) => {
  if (dragOverIndex.value === index) dragOverIndex.value = null
}

const onDrop = async (targetIndex: number) => {
  const fromIndex = dragIndex.value
  dragOverIndex.value = null
  dragIndex.value = null
  if (fromIndex === null || fromIndex === targetIndex) return

  const previousOrder = [...topics.value]
  const reordered = [...topics.value]
  const [moved] = reordered.splice(fromIndex, 1)
  reordered.splice(targetIndex, 0, moved)
  topics.value = reordered

  try {
    await reorderTopics(
      syllabusId.value,
      reordered.map((topic) => topic.id),
    )
  } catch (err) {
    console.log(err)
    topics.value = previousOrder
    snackbar.value = {
      show: true,
      message: t('syllabuses.editor.reorderError'),
      color: 'error',
    }
  }
}

const onDragEnd = () => {
  dragIndex.value = null
  dragOverIndex.value = null
}

onMounted(() => {
  loadSyllabus()
})
</script>

<style scoped>
.topics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(46, 38, 61, 0.12);
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  transition:
    box-shadow 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.topic-card:hover {
  border-color: rgba(1, 192, 200, 0.5);
  box-shadow: 0 2px 8px rgba(46, 38, 61, 0.08);
}

.topic-card.dragging {
  opacity: 0.4;
}

.topic-card.drag-over {
  border-color: rgb(1, 192, 200);
  box-shadow: 0 0 0 1px rgb(1, 192, 200);
}

.drag-handle {
  cursor: grab;
  color: rgba(46, 38, 61, 0.38);
}

.topic-order {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(1, 192, 200, 0.12);
  color: rgb(0, 150, 157);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.topic-main {
  flex-grow: 1;
  min-width: 0;
}

.topic-title {
  font-weight: 500;
  color: rgba(46, 38, 61, 0.9);
}

.topic-description {
  font-size: 0.8125rem;
  color: rgba(46, 38, 61, 0.6);
  max-width: 480px;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.content-indicators {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .topic-meta {
    display: none;
  }
}
</style>
