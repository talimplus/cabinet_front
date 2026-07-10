<template>
  <div>
    <div class="d-flex align-center mb-6 flex-wrap" style="gap: 12px">
      <div>
        <h1 class="text-h5">{{ $t('syllabuses.today.title') }}</h1>
        <div v-if="data" class="text-body-2 text-medium-emphasis">
          {{ formatFullDate(data.date) }}
        </div>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        icon="mdi-refresh"
        variant="text"
        color="medium-emphasis"
        :loading="loading"
        @click="load"
      ></v-btn>
    </div>

    <div v-if="loading && !data" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty: no lessons today -->
    <v-card v-else-if="data && sortedLessons.length === 0">
      <v-card-text class="text-center pa-12">
        <v-icon icon="mdi-white-balance-sunny" size="56" color="warning" class="mb-3"></v-icon>
        <div class="text-h6">{{ $t('syllabuses.today.noLessons') }}</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          {{ $t('syllabuses.today.noLessonsHint') }}
        </div>
      </v-card-text>
    </v-card>

    <!-- Lesson cards -->
    <div v-else-if="data" class="lessons-grid">
      <v-card v-for="(lesson, index) in sortedLessons" :key="index" class="lesson-card">
        <v-card-text>
          <!-- Card header -->
          <div class="d-flex align-center flex-wrap mb-3" style="gap: 8px">
            <div class="lesson-time">
              <v-icon icon="mdi-clock-outline" size="18" class="me-1"></v-icon>
              {{ lesson.startTime ? formatTime(lesson.startTime) : '—' }}
            </div>
            <div class="text-h6 flex-grow-1">{{ lesson.group.name }}</div>
            <v-chip size="small" variant="tonal" color="primary">
              {{ $t('syllabuses.today.lessonNumber', { n: lesson.lessonNumber }) }}
            </v-chip>
          </div>

          <div class="d-flex flex-wrap mb-4" style="gap: 8px">
            <v-chip v-if="lesson.group.subject" size="small" variant="outlined" prepend-icon="mdi-book-open-variant">
              {{ lesson.group.subject.name }}
            </v-chip>
            <v-chip v-if="lesson.group.room" size="small" variant="outlined" prepend-icon="mdi-door">
              {{ lesson.group.room.name }}
            </v-chip>
          </div>

          <!-- No syllabus -->
          <v-alert
            v-if="!lesson.hasSyllabus"
            type="warning"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            {{ $t('syllabuses.today.noSyllabus') }}
            <template v-slot:append>
              <v-btn
                size="small"
                variant="text"
                color="warning"
                :to="`/groups/${lesson.group.id}`"
              >
                {{ $t('syllabuses.today.goToPlan') }}
              </v-btn>
            </template>
          </v-alert>

          <!-- Syllabus, but no topics for today -->
          <v-alert
            v-else-if="lesson.topics.length === 0"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-2"
          >
            {{ $t('syllabuses.today.noTopicsAssigned') }}
            <template v-slot:append>
              <v-btn size="small" variant="text" color="info" :to="`/groups/${lesson.group.id}`">
                {{ $t('syllabuses.today.goToPlan') }}
              </v-btn>
            </template>
          </v-alert>

          <!-- Today's topics -->
          <template v-else>
            <div class="text-subtitle-2 text-medium-emphasis mb-2">
              {{ $t('syllabuses.today.todayTopics') }}
            </div>
            <v-expansion-panels variant="accordion" multiple>
              <v-expansion-panel v-for="topic in lesson.topics" :key="topic.id">
                <v-expansion-panel-title>
                  <div class="d-flex align-center flex-wrap" style="gap: 8px">
                    <span class="font-weight-medium">{{ topic.title }}</span>
                    <v-chip
                      v-if="topic.difficulty"
                      :color="difficultyColor(topic.difficulty)"
                      size="x-small"
                      variant="tonal"
                    >
                      {{ $t(`syllabuses.difficulty.${topic.difficulty}`) }}
                    </v-chip>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
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
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </template>

          <!-- Previous topics (collapsed) -->
          <v-expansion-panels
            v-if="lesson.previousTopics && lesson.previousTopics.length > 0"
            class="mt-3 previous-topics"
          >
            <v-expansion-panel elevation="0">
              <v-expansion-panel-title class="text-body-2 text-medium-emphasis">
                <v-icon icon="mdi-history" size="16" class="me-2"></v-icon>
                {{ $t('syllabuses.today.previousTopics') }}
                ({{ lesson.previousTopics.length }})
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-chip
                  v-for="topic in lesson.previousTopics"
                  :key="topic.id"
                  size="small"
                  variant="tonal"
                  class="me-1 mb-1"
                >
                  {{ topic.title }}
                </v-chip>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">{{ $t('common.close') }}</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchTeacherToday } from '@/services/pages/syllabuses'
import type { TeacherToday, TopicDifficulty } from '@/types/syllabus.types'
import MarkdownView from '@/components/pages/syllabus/MarkdownView.vue'

defineOptions({ name: 'TeacherToday' })

const { t, locale } = useI18n()

const data = ref<TeacherToday | null>(null)
const loading = ref(false)

const snackbar = ref({
  show: false,
  message: '',
  color: 'error',
})

const contentSections = [
  { key: 'guide', icon: 'mdi-book-open-page-variant-outline' },
  { key: 'lessonOutline', icon: 'mdi-format-list-bulleted' },
  { key: 'homework', icon: 'mdi-home-edit-outline' },
] as const

const sortedLessons = computed(() => {
  const lessons = [...(data.value?.lessons || [])]
  return lessons.sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
})

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

const formatTime = (time: string): string => {
  // 'HH:mm:ss' -> 'HH:mm'
  return time.slice(0, 5)
}

const formatFullDate = (dateString: string): string => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const load = async () => {
  loading.value = true
  try {
    data.value = await fetchTeacherToday()
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('syllabuses.today.loadError'), color: 'error' }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.lessons-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-time {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  font-size: 1rem;
  color: rgb(0, 150, 157);
  min-width: 72px;
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

.previous-topics :deep(.v-expansion-panel) {
  background: rgba(46, 38, 61, 0.02);
}
</style>
