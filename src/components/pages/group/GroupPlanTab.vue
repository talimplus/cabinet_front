<template>
  <v-card-text>
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- No syllabus attached -->
    <div v-else-if="plan && !plan.syllabus" class="text-center pa-8">
      <v-icon icon="mdi-book-off-outline" size="56" color="grey-lighten-1" class="mb-3"></v-icon>
      <div class="text-h6 mb-1">{{ $t('syllabuses.plan.noSyllabus') }}</div>
      <div v-if="canManageGroupSyllabus" class="d-flex justify-center mt-6">
        <div style="width: 100%; max-width: 420px">
          <v-select
            v-model="selectedSyllabusId"
            :items="availableSyllabuses"
            :label="$t('syllabuses.plan.selectSyllabus')"
            item-title="name"
            item-value="id"
            :loading="loadingSyllabuses"
          >
            <template v-slot:item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="item.raw.subject?.name"></v-list-item>
            </template>
          </v-select>
          <v-btn
            color="primary"
            class="mt-4"
            block
            :disabled="!selectedSyllabusId"
            :loading="attaching"
            @click="attachSyllabus"
          >
            {{ $t('syllabuses.plan.attach') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Syllabus attached: plan view -->
    <template v-else-if="plan && plan.syllabus">
      <!-- Toolbar -->
      <div class="d-flex align-center flex-wrap mb-4" style="gap: 8px">
        <v-chip color="primary" variant="tonal" prepend-icon="mdi-book-open-variant">
          {{ plan.syllabus.name }}
        </v-chip>
        <v-chip v-if="plan.totalLessons" size="small" variant="outlined">
          {{ $t('syllabuses.plan.totalLessons') }}: {{ plan.totalLessons }}
        </v-chip>
        <v-chip v-if="plan.horizonDate" size="small" variant="outlined">
          {{ $t('syllabuses.plan.horizon') }}: {{ formatDate(plan.horizonDate) }}
        </v-chip>
        <v-spacer></v-spacer>
        <v-btn
          v-if="canEditPlan"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-creation"
          @click="openDistributeDialog"
        >
          {{ $t('syllabuses.plan.distribute.button') }}
        </v-btn>
        <v-btn
          v-if="canManageGroupSyllabus"
          variant="outlined"
          prepend-icon="mdi-swap-horizontal"
          @click="openChangeDialog"
        >
          {{ $t('syllabuses.plan.change') }}
        </v-btn>
        <v-btn
          v-if="canManageGroupSyllabus"
          variant="text"
          color="error"
          prepend-icon="mdi-link-off"
          @click="detachDialog = true"
        >
          {{ $t('syllabuses.plan.detach') }}
        </v-btn>
      </div>

      <v-row>
        <!-- Lessons table -->
        <v-col cols="12" md="8">
          <v-expansion-panels v-model="expandedLesson" variant="accordion">
            <v-expansion-panel
              v-for="lesson in plan.lessons"
              :key="lesson.lessonNumber"
              :value="lesson.lessonNumber"
              :class="{
                'lesson-today': lesson.isToday,
                'lesson-past': lesson.isPast && !lesson.isToday,
              }"
            >
              <v-expansion-panel-title>
                <div class="lesson-row">
                  <div class="lesson-number">{{ lesson.lessonNumber }}</div>
                  <div class="lesson-date">
                    <template v-if="lesson.date">{{ formatDate(lesson.date) }}</template>
                    <span v-else class="text-medium-emphasis">
                      {{ $t('syllabuses.plan.lessonsTable.noDate') }}
                    </span>
                    <v-chip v-if="lesson.isToday" color="primary" size="x-small" class="ms-2">
                      {{ $t('syllabuses.plan.lessonsTable.today') }}
                    </v-chip>
                  </div>
                  <div class="lesson-topics">
                    <template v-if="lesson.topics.length > 0">
                      <v-chip
                        v-for="topic in lesson.topics"
                        :key="topic.id"
                        size="small"
                        variant="tonal"
                        class="me-1 mb-1"
                      >
                        {{ topic.title }}
                      </v-chip>
                    </template>
                    <span v-else class="text-medium-emphasis text-body-2">
                      {{ $t('syllabuses.plan.lessonsTable.noTopics') }}
                    </span>
                  </div>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Darsga biriktirilgan mavzular bo'yicha to'liq ma'lumot -->
                <div v-if="lesson.topics.length > 0" class="assigned-topics mb-4">
                  <div
                    v-for="topic in lesson.topics"
                    :key="topic.id"
                    class="assigned-topic"
                  >
                    <div class="d-flex align-center flex-wrap mb-2" style="gap: 8px">
                      <span class="text-subtitle-1 font-weight-medium">{{ topic.title }}</span>
                      <v-chip
                        v-if="topic.difficulty"
                        :color="difficultyColor(topic.difficulty)"
                        size="x-small"
                        variant="tonal"
                      >
                        {{ $t(`syllabuses.difficulty.${topic.difficulty}`) }}
                      </v-chip>
                      <v-chip v-if="topic.estimatedLessons" size="x-small" variant="outlined">
                        {{ $t('syllabuses.editor.estimatedLessons', { n: topic.estimatedLessons }) }}
                      </v-chip>
                    </div>
                    <div v-if="topic.description" class="text-body-2 text-medium-emphasis mb-3">
                      {{ topic.description }}
                    </div>
                    <div
                      v-for="section in contentSections"
                      :key="section.key"
                      class="content-section"
                    >
                      <div class="content-section-title">
                        <v-icon :icon="section.icon" size="16" class="me-1"></v-icon>
                        {{ $t(`syllabuses.content.${section.key}`) }}
                      </div>
                      <MarkdownView
                        v-if="topic[section.key]?.trim()"
                        :source="topic[section.key]"
                      />
                      <div v-else class="text-body-2 text-medium-emphasis">
                        {{ $t('syllabuses.content.notFilled') }}
                      </div>
                    </div>
                  </div>
                  <v-divider class="my-4"></v-divider>
                </div>

                <div class="text-body-2 text-medium-emphasis mb-2">
                  {{ $t('syllabuses.plan.selectTopics') }}
                </div>
                <div class="topic-checkbox-list">
                  <v-checkbox
                    v-for="topic in plan.syllabus.topics"
                    :key="topic.id"
                    :model-value="isTopicSelected(lesson.lessonNumber, topic.id)"
                    density="compact"
                    hide-details
                    color="primary"
                    :readonly="!canEditPlan"
                    @update:model-value="toggleTopic(lesson.lessonNumber, topic.id, $event)"
                  >
                    <template v-slot:label>
                      <span class="topic-checkbox-label">
                        <span
                          v-if="topic.difficulty"
                          class="difficulty-dot"
                          :class="`difficulty-${topic.difficulty}`"
                        ></span>
                        {{ topic.title }}
                      </span>
                    </template>
                  </v-checkbox>
                </div>
                <div v-if="canEditPlan" class="d-flex justify-end mt-3">
                  <v-btn
                    color="primary"
                    size="small"
                    :loading="savingLesson === lesson.lessonNumber"
                    :disabled="!isLessonDirty(lesson.lessonNumber)"
                    @click="saveLessonTopics(lesson.lessonNumber)"
                  >
                    {{ $t('common.save') }}
                  </v-btn>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>

        <!-- Side panel: syllabus topics -->
        <v-col cols="12" md="4">
          <v-card variant="outlined">
            <v-card-title class="text-subtitle-1">
              {{ $t('syllabuses.plan.sidePanel.title') }}
            </v-card-title>
            <v-divider></v-divider>
            <v-list density="compact" class="side-topic-list">
              <v-list-item v-for="topic in plan.syllabus.topics" :key="topic.id">
                <template v-slot:prepend>
                  <span class="side-topic-order">{{ topic.orderIndex }}</span>
                </template>
                <v-list-item-title :class="{ 'text-medium-emphasis': topic.isAssigned === false }">
                  {{ topic.title }}
                </v-list-item-title>
                <template v-slot:append>
                  <v-chip
                    v-if="topic.isAssigned === false"
                    size="x-small"
                    color="warning"
                    variant="tonal"
                  >
                    {{ $t('syllabuses.plan.sidePanel.unassigned') }}
                  </v-chip>
                  <v-icon v-else size="16" color="success" icon="mdi-check"></v-icon>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Change syllabus dialog -->
    <v-dialog v-model="changeDialog.show" max-width="480">
      <v-card :title="$t('syllabuses.plan.replaceWarningTitle')">
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            {{ $t('syllabuses.plan.replaceWarningText') }}
          </v-alert>
          <v-select
            v-model="changeDialog.syllabusId"
            :items="availableSyllabuses"
            :label="$t('syllabuses.plan.selectSyllabus')"
            item-title="name"
            item-value="id"
            :loading="loadingSyllabuses"
          >
            <template v-slot:item="{ props: itemProps, item }">
              <v-list-item v-bind="itemProps" :subtitle="item.raw.subject?.name"></v-list-item>
            </template>
          </v-select>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="changeDialog.show = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="changeDialog.loading"
            :disabled="!changeDialog.syllabusId || changeDialog.syllabusId === plan?.syllabus?.id"
            @click="confirmChangeSyllabus"
          >
            {{ $t('syllabuses.plan.change') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- Detach confirmation -->
    <v-dialog v-model="detachDialog" max-width="440">
      <v-card :title="$t('syllabuses.plan.detachWarningTitle')">
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact">
            {{ $t('syllabuses.plan.detachWarningText') }}
          </v-alert>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="detachDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="detaching" @click="detachSyllabus">
            {{ $t('syllabuses.plan.detach') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- AI distribute dialog -->
    <v-dialog v-model="distributeDialog.show" max-width="520">
      <v-card :title="$t('syllabuses.plan.distribute.title')">
        <v-card-text>
          <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
            {{ $t('syllabuses.plan.distribute.warning') }}
          </v-alert>
          <v-text-field
            v-model.number="distributeDialog.totalLessons"
            :label="$t('syllabuses.plan.distribute.totalLessons')"
            :placeholder="$t('syllabuses.plan.distribute.totalLessonsPlaceholder')"
            type="number"
            min="1"
            class="mb-3"
          ></v-text-field>
          <v-textarea
            v-model="distributeDialog.instructions"
            :label="$t('syllabuses.plan.distribute.instructions')"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="distributeDialog.show = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="distributeDialog.loading"
            @click="runDistribute"
          >
            {{ $t('syllabuses.plan.distribute.run') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </v-card-text>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  fetchGroupPlan,
  fetchSyllabuses,
  setGroupSyllabus,
  setLessonTopics,
  distributePlan,
} from '@/services/pages/syllabuses'
import type { GroupPlan, SyllabusListItem, TopicDifficulty } from '@/types/syllabus.types'
import { usePermissions } from '@/composables/usePermissions'
import MarkdownView from '@/components/pages/syllabus/MarkdownView.vue'

defineOptions({ name: 'GroupPlanTab' })

const contentSections = [
  { key: 'guide', icon: 'mdi-book-open-page-variant-outline' },
  { key: 'lessonOutline', icon: 'mdi-format-list-bulleted' },
  { key: 'homework', icon: 'mdi-home-edit-outline' },
] as const

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

interface Props {
  groupId: number | string
  // Joriy foydalanuvchi shu guruhning o'qituvchisimi (teacher uchun muhim)
  isOwnGroup?: boolean
}

const props = defineProps<Props>()
const { t } = useI18n()
const { canManageGroupSyllabus, canEditLessonPlan } = usePermissions()

// Dars rejasini tahrirlash: manager-level har doim; teacher faqat o'z guruhida
const canEditPlan = computed(() => canEditLessonPlan(props.isOwnGroup ?? false))

const plan = ref<GroupPlan | null>(null)
const loading = ref(false)

const availableSyllabuses = ref<SyllabusListItem[]>([])
const loadingSyllabuses = ref(false)
const selectedSyllabusId = ref<number | null>(null)
const attaching = ref(false)

const expandedLesson = ref<number | null>(null)
const lessonSelections = ref<Record<number, number[]>>({})
const savingLesson = ref<number | null>(null)

const changeDialog = ref<{ show: boolean; loading: boolean; syllabusId: number | null }>({
  show: false,
  loading: false,
  syllabusId: null,
})
const detachDialog = ref(false)
const detaching = ref(false)

const distributeDialog = ref<{
  show: boolean
  loading: boolean
  totalLessons: number | null
  instructions: string
}>({
  show: false,
  loading: false,
  totalLessons: null,
  instructions: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const initSelections = () => {
  const selections: Record<number, number[]> = {}
  for (const lesson of plan.value?.lessons || []) {
    selections[lesson.lessonNumber] = lesson.topics.map((topic) => topic.id)
  }
  lessonSelections.value = selections
}

const loadPlan = async () => {
  loading.value = !plan.value
  try {
    plan.value = await fetchGroupPlan(props.groupId)
    initSelections()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    loading.value = false
  }
}

const loadSyllabuses = async () => {
  loadingSyllabuses.value = true
  try {
    const subjectId = plan.value?.group?.subject?.id
    const {
      data: { data },
    } = await fetchSyllabuses({ subjectId, page: 1, perPage: 100 })
    availableSyllabuses.value = data
  } catch (err) {
    console.log(err)
  } finally {
    loadingSyllabuses.value = false
  }
}

const attachSyllabus = async () => {
  if (!selectedSyllabusId.value) return
  attaching.value = true
  try {
    await setGroupSyllabus(props.groupId, selectedSyllabusId.value)
    selectedSyllabusId.value = null
    await loadPlan()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    attaching.value = false
  }
}

const openChangeDialog = () => {
  changeDialog.value = { show: true, loading: false, syllabusId: plan.value?.syllabus?.id ?? null }
  if (availableSyllabuses.value.length === 0) loadSyllabuses()
}

const confirmChangeSyllabus = async () => {
  if (!changeDialog.value.syllabusId) return
  changeDialog.value.loading = true
  try {
    await setGroupSyllabus(props.groupId, changeDialog.value.syllabusId)
    changeDialog.value.show = false
    await loadPlan()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    changeDialog.value.loading = false
  }
}

const detachSyllabus = async () => {
  detaching.value = true
  try {
    await setGroupSyllabus(props.groupId, null)
    detachDialog.value = false
    await loadPlan()
    loadSyllabuses()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    detaching.value = false
  }
}

// --- Lesson topics ---------------------------------------------------------
const isTopicSelected = (lessonNumber: number, topicId: number): boolean => {
  return (lessonSelections.value[lessonNumber] || []).includes(topicId)
}

const toggleTopic = (lessonNumber: number, topicId: number, checked: boolean | null) => {
  const current = lessonSelections.value[lessonNumber] || []
  if (checked) {
    if (!current.includes(topicId)) {
      lessonSelections.value[lessonNumber] = [...current, topicId]
    }
  } else {
    lessonSelections.value[lessonNumber] = current.filter((id) => id !== topicId)
  }
}

const isLessonDirty = (lessonNumber: number): boolean => {
  const lesson = plan.value?.lessons.find((item) => item.lessonNumber === lessonNumber)
  if (!lesson) return false
  const original = lesson.topics.map((topic) => topic.id).sort()
  const current = [...(lessonSelections.value[lessonNumber] || [])].sort()
  return JSON.stringify(original) !== JSON.stringify(current)
}

const saveLessonTopics = async (lessonNumber: number) => {
  savingLesson.value = lessonNumber
  try {
    // Shu darsning TO'LIQ ro'yxati yuboriladi; bo'sh massiv = tozalash
    await setLessonTopics(props.groupId, lessonNumber, lessonSelections.value[lessonNumber] || [])
    snackbar.value = { show: true, message: t('syllabuses.plan.topicsSaved'), color: 'success' }
    await loadPlan()
  } catch (err) {
    console.log(err)
    snackbar.value = {
      show: true,
      message: t('syllabuses.plan.topicsSaveError'),
      color: 'error',
    }
  } finally {
    savingLesson.value = null
  }
}

// --- AI distribute -----------------------------------------------------------
const openDistributeDialog = () => {
  distributeDialog.value = { show: true, loading: false, totalLessons: null, instructions: '' }
}

const runDistribute = async () => {
  distributeDialog.value.loading = true
  try {
    const updated = await distributePlan(props.groupId, {
      totalLessons: distributeDialog.value.totalLessons || undefined,
      instructions: distributeDialog.value.instructions.trim() || undefined,
    })
    plan.value = updated
    initSelections()
    distributeDialog.value.show = false
    snackbar.value = {
      show: true,
      message: t('syllabuses.plan.distribute.success'),
      color: 'success',
    }
  } catch (err) {
    const status = (err as any)?.response?.status
    let message = t('common.error')
    if (status === 503) {
      message = t('syllabuses.ai.notConfigured')
    } else if (status === 400) {
      message =
        (err as any)?.response?.data?.message || t('syllabuses.plan.distribute.needTotalLessons')
      if (Array.isArray(message)) message = message.join(', ')
    }
    snackbar.value = { show: true, message, color: 'error' }
    console.log(err)
  } finally {
    distributeDialog.value.loading = false
  }
}

onMounted(async () => {
  await loadPlan()
  if (plan.value && !plan.value.syllabus) {
    loadSyllabuses()
  }
})
</script>

<style scoped>
.lesson-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.lesson-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(46, 38, 61, 0.06);
  color: rgba(46, 38, 61, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8125rem;
  font-weight: 600;
  flex-shrink: 0;
}

.lesson-date {
  width: 140px;
  flex-shrink: 0;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

.lesson-topics {
  flex-grow: 1;
  min-width: 0;
}

.lesson-today {
  background: rgba(1, 192, 200, 0.06);
}

.lesson-today .lesson-number {
  background: rgb(1, 192, 200);
  color: #ffffff;
}

.lesson-past {
  opacity: 0.6;
}

.assigned-topic + .assigned-topic {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(46, 38, 61, 0.08);
}

.content-section {
  padding: 10px 0;
}

.content-section + .content-section {
  border-top: 1px solid rgba(46, 38, 61, 0.08);
}

.content-section-title {
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(46, 38, 61, 0.6);
  margin-bottom: 6px;
}

.topic-checkbox-list {
  display: flex;
  flex-direction: column;
  max-height: 320px;
  overflow-y: auto;
}

.topic-checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
}

.difficulty-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.difficulty-easy {
  background: #56ca00;
}

.difficulty-medium {
  background: #ffb400;
}

.difficulty-hard {
  background: #ff4c51;
}

.side-topic-list {
  max-height: 560px;
  overflow-y: auto;
}

.side-topic-order {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(46, 38, 61, 0.06);
  color: rgba(46, 38, 61, 0.68);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  margin-right: 10px;
}
</style>
