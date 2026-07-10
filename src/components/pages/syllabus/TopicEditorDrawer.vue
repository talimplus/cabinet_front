<template>
  <v-navigation-drawer
    v-model="open"
    location="right"
    temporary
    width="720"
    class="topic-drawer"
  >
    <div v-if="topic" class="d-flex flex-column h-100">
      <!-- Header -->
      <div class="drawer-header d-flex align-center px-4 py-3">
        <div class="text-h6 flex-grow-1 text-truncate">{{ topic.title }}</div>
        <v-btn
          v-if="!readonly"
          icon="mdi-delete-outline"
          variant="text"
          color="error"
          size="small"
          @click="deleteConfirm = true"
        ></v-btn>
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false"></v-btn>
      </div>
      <v-divider></v-divider>

      <div class="drawer-body flex-grow-1 overflow-y-auto pa-4">
        <!-- Meta fields -->
        <v-row dense class="mb-2">
          <v-col cols="12">
            <v-text-field
              v-model="form.title"
              :label="$t('syllabuses.editor.topicTitle')"
              density="compact"
              :readonly="readonly"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              :label="$t('syllabuses.editor.topicDescription')"
              rows="2"
              density="compact"
              :readonly="readonly"
            ></v-textarea>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="form.difficulty"
              :items="difficultyItems"
              :label="$t('syllabuses.editor.difficulty')"
              density="compact"
              clearable
              :disabled="readonly"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model.number="form.estimatedLessons"
              :label="$t('syllabuses.editor.estimatedLessonsLabel')"
              type="number"
              min="1"
              density="compact"
              :readonly="readonly"
            ></v-text-field>
          </v-col>
        </v-row>

        <!-- Content tabs -->
        <v-tabs v-model="activeTab" color="primary" density="compact">
          <v-tab v-for="tab in contentTabs" :key="tab.key" :value="tab.key">
            <v-icon
              start
              size="14"
              :icon="form[tab.key]?.trim() ? 'mdi-circle' : 'mdi-circle-outline'"
              :color="form[tab.key]?.trim() ? 'success' : 'grey'"
            ></v-icon>
            {{ $t(`syllabuses.content.${tab.key}`) }}
          </v-tab>
        </v-tabs>
        <v-divider></v-divider>

        <v-window v-model="activeTab" class="pt-3">
          <v-window-item v-for="tab in contentTabs" :key="tab.key" :value="tab.key">
            <div v-if="!readonly" class="d-flex align-center mb-2" style="gap: 8px">
              <v-btn-toggle v-model="viewMode" density="compact" mandatory color="primary">
                <v-btn value="edit" size="small" prepend-icon="mdi-pencil-outline">
                  {{ $t('common.edit') }}
                </v-btn>
                <v-btn value="preview" size="small" prepend-icon="mdi-eye-outline">
                  {{ $t('syllabuses.content.preview') }}
                </v-btn>
              </v-btn-toggle>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="mdi-creation"
                :loading="generating"
                @click="aiDialog = true"
              >
                {{ $t('syllabuses.ai.generate') }}
              </v-btn>
            </div>

            <v-textarea
              v-if="viewMode === 'edit' && !readonly"
              v-model="form[tab.key]"
              :placeholder="$t('syllabuses.content.editorPlaceholder')"
              rows="16"
              auto-grow
              class="content-textarea"
            ></v-textarea>
            <v-card v-else variant="outlined" class="pa-4 preview-card">
              <MarkdownView v-if="form[tab.key]?.trim()" :source="form[tab.key]" />
              <div v-else class="text-medium-emphasis text-body-2">
                {{ $t('syllabuses.content.notFilled') }}
              </div>
            </v-card>
          </v-window-item>
        </v-window>
      </div>

      <!-- Footer -->
      <v-divider></v-divider>
      <div class="pa-4 d-flex justify-end" style="gap: 8px">
        <v-btn variant="text" @click="open = false">
          {{ readonly ? $t('common.close') : $t('common.cancel') }}
        </v-btn>
        <v-btn v-if="!readonly" color="primary" :loading="saving" @click="save">
          {{ $t('common.save') }}
        </v-btn>
      </div>
    </div>

    <!-- AI generate dialog -->
    <v-dialog v-model="aiDialog" max-width="480">
      <v-card :title="$t('syllabuses.ai.generate')">
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('syllabuses.ai.generateHint') }}
          </div>
          <v-text-field
            v-model="aiForm.audience"
            :label="$t('syllabuses.ai.audience')"
            :placeholder="$t('syllabuses.ai.audiencePlaceholder')"
            class="mb-3"
          ></v-text-field>
          <v-textarea
            v-model="aiForm.instructions"
            :label="$t('syllabuses.ai.instructions')"
            rows="3"
          ></v-textarea>
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="aiDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :loading="generating" @click="generate">
            {{ $t('syllabuses.ai.generate') }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- Delete topic confirmation -->
    <v-dialog v-model="deleteConfirm" max-width="440">
      <v-card :title="$t('syllabuses.editor.deleteTopicTitle')">
        <v-card-text>
          {{ $t('syllabuses.editor.deleteTopicText', { title: topic?.title }) }}
        </v-card-text>
        <template v-slot:actions>
          <v-spacer></v-spacer>
          <v-btn @click="deleteConfirm = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="removeTopic">
            {{ $t('common.delete') }}
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
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { updateTopic, deleteTopic, generateTopicContent } from '@/services/pages/syllabuses'
import type { SyllabusTopic, TopicDifficulty } from '@/types/syllabus.types'
import MarkdownView from './MarkdownView.vue'

defineOptions({ name: 'TopicEditorDrawer' })

type ContentKey = 'guide' | 'lessonOutline' | 'homework'

interface Props {
  syllabusId: number | string
  topic: SyllabusTopic | null
  readonly?: boolean
}

interface Emits {
  (e: 'saved'): void
  (e: 'deleted'): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()

const activeTab = ref<ContentKey>('guide')
const viewMode = ref<'edit' | 'preview'>('edit')
const saving = ref(false)
const deleting = ref(false)
const generating = ref(false)
const aiDialog = ref(false)
const deleteConfirm = ref(false)

const contentTabs: { key: ContentKey }[] = [
  { key: 'guide' },
  { key: 'lessonOutline' },
  { key: 'homework' },
]

interface TopicEditForm {
  title: string
  description: string
  difficulty: TopicDifficulty | null
  estimatedLessons: number | null
  guide: string
  lessonOutline: string
  homework: string
}

const form = ref<TopicEditForm>({
  title: '',
  description: '',
  difficulty: null,
  estimatedLessons: null,
  guide: '',
  lessonOutline: '',
  homework: '',
})

const aiForm = ref({
  audience: '',
  instructions: '',
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

watch(
  () => [open.value, props.topic] as const,
  ([isOpen, topic]) => {
    if (isOpen && topic) {
      form.value = {
        title: topic.title || '',
        description: topic.description || '',
        difficulty: topic.difficulty || null,
        estimatedLessons: topic.estimatedLessons ?? null,
        guide: topic.guide || '',
        lessonOutline: topic.lessonOutline || '',
        homework: topic.homework || '',
      }
      activeTab.value = 'guide'
      viewMode.value = 'edit'
      aiForm.value = { audience: '', instructions: '' }
    }
  },
  { immediate: true },
)

const save = async () => {
  if (!props.topic) return
  saving.value = true
  try {
    await updateTopic(props.syllabusId, props.topic.id, {
      title: form.value.title.trim(),
      description: form.value.description.trim() || undefined,
      difficulty: form.value.difficulty || undefined,
      estimatedLessons: form.value.estimatedLessons || undefined,
      guide: form.value.guide,
      lessonOutline: form.value.lessonOutline,
      homework: form.value.homework,
    })
    snackbar.value = { show: true, message: t('common.success'), color: 'success' }
    open.value = false
    emits('saved')
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    saving.value = false
  }
}

const removeTopic = async () => {
  if (!props.topic) return
  deleting.value = true
  try {
    await deleteTopic(props.syllabusId, props.topic.id)
    deleteConfirm.value = false
    open.value = false
    emits('deleted')
  } catch (err) {
    console.log(err)
    snackbar.value = { show: true, message: t('common.error'), color: 'error' }
  } finally {
    deleting.value = false
  }
}

const generate = async () => {
  if (!props.topic) return
  generating.value = true
  try {
    const result = await generateTopicContent(props.syllabusId, props.topic.id, {
      audience: aiForm.value.audience.trim() || undefined,
      instructions: aiForm.value.instructions.trim() || undefined,
    })
    // AI natijasi bazaga saqlanmaydi — faqat formaga to'ldiriladi
    if (result.guide != null) form.value.guide = result.guide
    if (result.lessonOutline != null) form.value.lessonOutline = result.lessonOutline
    if (result.homework != null) form.value.homework = result.homework
    aiDialog.value = false
    viewMode.value = 'preview'
    snackbar.value = { show: true, message: t('syllabuses.ai.generated'), color: 'success' }
  } catch (err) {
    const status = (err as any)?.response?.status
    snackbar.value = {
      show: true,
      message: status === 503 ? t('syllabuses.ai.notConfigured') : t('syllabuses.ai.error'),
      color: 'error',
    }
    console.log(err)
  } finally {
    generating.value = false
  }
}
</script>

<style scoped>
/* Telefonda drawer ekrandan chiqib ketmasligi uchun */
.topic-drawer {
  max-width: 100vw;
}

.drawer-header {
  min-height: 56px;
}

.drawer-body {
  min-height: 0;
}

.content-textarea :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.55;
}

.preview-card {
  min-height: 200px;
  max-height: 520px;
  overflow-y: auto;
}
</style>
