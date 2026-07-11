<template>
  <v-dialog v-model="open" max-width="720" persistent scrollable>
    <v-card class="ai-modal">
      <v-card-title class="d-flex align-center justify-space-between pe-2">
        <span class="d-flex align-center" style="gap: 8px">
          <v-icon icon="mdi-creation" color="primary"></v-icon>
          {{ $t('syllabuses.aiChat.title') }}
        </span>
        <v-btn icon="mdi-close" variant="text" size="small" @click="open = false"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Subject select -->
      <div class="px-4 pt-3">
        <v-select
          v-model="subjectId"
          :items="subjects"
          :label="$t('syllabuses.aiChat.subject')"
          item-title="name"
          item-value="id"
          density="compact"
          variant="outlined"
          hide-details="auto"
          clearable
          :error-messages="subjectError ? [$t('syllabuses.aiChat.subjectRequired')] : []"
          @update:model-value="subjectError = false"
        ></v-select>
      </div>

      <!-- Chat messages -->
      <v-card-text ref="scrollRef" class="chat-body">
        <!-- Empty state -->
        <div v-if="!messages.length && !loading" class="empty-state text-medium-emphasis">
          <v-icon icon="mdi-robot-happy-outline" size="40" class="mb-2"></v-icon>
          <div class="text-body-2">{{ $t('syllabuses.aiChat.placeholderExample') }}</div>
        </div>

        <template v-for="(msg, index) in messages" :key="index">
          <div class="msg-row" :class="msg.role === 'user' ? 'msg-user' : 'msg-assistant'">
            <div class="msg-bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'">
              <MarkdownView v-if="msg.role === 'assistant'" :source="msg.content" />
              <template v-else>{{ msg.content }}</template>
            </div>
          </div>
        </template>

        <!-- Plan preview card -->
        <div v-if="plan" class="msg-row msg-assistant">
          <v-card class="plan-card" variant="outlined">
            <div class="pa-3">
              <v-text-field
                v-model="plan.name"
                :label="$t('syllabuses.aiChat.planName')"
                density="compact"
                variant="outlined"
                hide-details
                class="mb-2"
              ></v-text-field>
              <div v-if="plan.description" class="text-body-2 text-medium-emphasis mb-2">
                {{ plan.description }}
              </div>
              <div class="d-flex align-center flex-wrap mb-2" style="gap: 8px">
                <v-chip size="small" variant="tonal" color="primary" prepend-icon="mdi-book-clock-outline">
                  {{ $t('syllabuses.aiChat.totalLessons') }}: {{ totalLessons }}
                </v-chip>
                <v-chip size="small" variant="tonal" prepend-icon="mdi-format-list-numbered">
                  {{ $t('syllabuses.aiChat.topicsTitle') }}: {{ plan.topics.length }}
                </v-chip>
              </div>

              <v-table density="compact" class="plan-table">
                <thead>
                  <tr>
                    <th style="width: 40px">{{ $t('syllabuses.aiChat.topicNumber') }}</th>
                    <th>{{ $t('syllabuses.aiChat.topicTitleCol') }}</th>
                    <th style="width: 110px">{{ $t('syllabuses.aiChat.difficultyCol') }}</th>
                    <th style="width: 70px" class="text-center">{{ $t('syllabuses.aiChat.lessonsCol') }}</th>
                    <th style="width: 96px"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(topic, tIndex) in plan.topics" :key="tIndex">
                    <td>{{ tIndex + 1 }}</td>
                    <td>
                      <v-text-field
                        v-model="topic.title"
                        density="compact"
                        variant="plain"
                        hide-details
                        class="topic-title-field"
                      ></v-text-field>
                    </td>
                    <td>
                      <v-chip :color="difficultyColor(topic.difficulty)" size="small" variant="tonal">
                        {{ $t(`syllabuses.difficulty.${topic.difficulty}`) }}
                      </v-chip>
                    </td>
                    <td class="text-center">{{ topic.estimatedLessons }}</td>
                    <td>
                      <div class="d-flex">
                        <v-btn
                          icon="mdi-arrow-up"
                          variant="text"
                          size="x-small"
                          density="comfortable"
                          :disabled="tIndex === 0"
                          @click="moveTopic(tIndex, -1)"
                        ></v-btn>
                        <v-btn
                          icon="mdi-arrow-down"
                          variant="text"
                          size="x-small"
                          density="comfortable"
                          :disabled="tIndex === plan.topics.length - 1"
                          @click="moveTopic(tIndex, 1)"
                        ></v-btn>
                        <v-btn
                          icon="mdi-delete-outline"
                          variant="text"
                          size="x-small"
                          density="comfortable"
                          color="error"
                          @click="removeTopic(tIndex)"
                        ></v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>

              <div class="d-flex justify-end mt-3" style="gap: 8px">
                <v-btn variant="text" size="small" @click="focusInput">
                  {{ $t('syllabuses.aiChat.askAgain') }}
                </v-btn>
                <v-btn
                  color="primary"
                  variant="flat"
                  size="small"
                  :loading="saving"
                  :disabled="!canSave"
                  @click="savePlan"
                >
                  {{ $t('syllabuses.aiChat.savePlan') }}
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Typing indicator -->
        <div v-if="loading" class="msg-row msg-assistant">
          <div class="msg-bubble bubble-assistant typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>

        <!-- Service error (503) -->
        <div v-if="serviceError" class="msg-row msg-assistant">
          <div class="msg-bubble bubble-assistant error-bubble">
            <div class="d-flex align-center mb-2" style="gap: 6px">
              <v-icon icon="mdi-alert-circle-outline" color="error" size="18"></v-icon>
              <span>{{ $t('syllabuses.aiChat.serviceError') }}</span>
            </div>
            <v-btn size="small" variant="tonal" color="error" @click="retry">
              {{ $t('syllabuses.aiChat.retry') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Limit warning -->
      <v-alert
        v-if="nearLimit"
        type="warning"
        variant="tonal"
        density="compact"
        class="mx-4 mt-2"
      >
        {{ $t('syllabuses.aiChat.limitWarning') }}
        <template v-slot:append>
          <v-btn size="small" variant="text" @click="resetChat">
            {{ $t('syllabuses.aiChat.newChat') }}
          </v-btn>
        </template>
      </v-alert>

      <!-- Input -->
      <div class="pa-4 d-flex align-end" style="gap: 8px">
        <v-textarea
          v-model="input"
          ref="inputRef"
          :placeholder="$t('syllabuses.aiChat.inputPlaceholder')"
          density="compact"
          variant="outlined"
          rows="1"
          auto-grow
          max-rows="4"
          hide-details="auto"
          :counter="MAX_MESSAGE_LENGTH"
          :maxlength="MAX_MESSAGE_LENGTH"
          :disabled="loading || limitReached"
          @keydown.enter.exact.prevent="send"
        ></v-textarea>
        <v-btn
          icon="mdi-send"
          color="primary"
          :loading="loading"
          :disabled="!input.trim() || limitReached"
          @click="send"
        ></v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { aiChat, aiSavePlan } from '@/services/pages/syllabuses'
import type {
  AiChatMessage,
  AiPlan,
  AiPlanTopic,
  TopicDifficulty,
} from '@/types/syllabus.types'
import type { Subject } from '@/types/subject.types'
import MarkdownView from './MarkdownView.vue'

defineOptions({ name: 'AiSyllabusModal' })

interface Props {
  subjects: Subject[]
}
interface Emits {
  (e: 'updateData'): void
  (e: 'created', message: string): void
}

defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel<boolean>('open', { default: false })

const router = useRouter()
const { t } = useI18n()

const MAX_MESSAGES = 40
const MAX_MESSAGE_LENGTH = 4000
const NEAR_LIMIT = 36

const subjectId = ref<number | undefined>(undefined)
const subjectError = ref(false)
const input = ref('')
const messages = ref<AiChatMessage[]>([])
const plan = ref<AiPlan | null>(null)
const loading = ref(false)
const saving = ref(false)
const serviceError = ref(false)

const scrollRef = ref<{ $el: HTMLElement } | null>(null)
const inputRef = ref<{ focus: () => void } | null>(null)

const limitReached = computed(() => messages.value.length >= MAX_MESSAGES)
const nearLimit = computed(() => messages.value.length >= NEAR_LIMIT)

const totalLessons = computed(() => {
  if (!plan.value) return 0
  if (plan.value.totalLessons) return plan.value.totalLessons
  return plan.value.topics.reduce((sum, tpc) => sum + (tpc.estimatedLessons || 0), 0)
})

const canSave = computed(() => !!plan.value && !!plan.value.name.trim() && plan.value.topics.length > 0)

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

const scrollToBottom = async () => {
  await nextTick()
  const el = scrollRef.value?.$el
  if (el) el.scrollTop = el.scrollHeight
}

const focusInput = () => {
  inputRef.value?.focus()
}

const resetChat = () => {
  messages.value = []
  plan.value = null
  input.value = ''
  serviceError.value = false
}

const requestChat = async () => {
  loading.value = true
  serviceError.value = false
  await scrollToBottom()
  try {
    const res = await aiChat({
      subjectId: subjectId.value,
      messages: messages.value,
    })
    messages.value.push({ role: 'assistant', content: res.message })
    if (res.type === 'plan') {
      plan.value = {
        ...res.plan,
        topics: res.plan.topics.map((tpc) => ({ ...tpc })),
      }
    }
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 503) {
      serviceError.value = true
    } else {
      console.log(err)
    }
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value || limitReached.value) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  await requestChat()
}

// 503 retry — last message is already a user message, just re-request.
const retry = async () => {
  serviceError.value = false
  await requestChat()
}

const moveTopic = (index: number, direction: number) => {
  if (!plan.value) return
  const target = index + direction
  if (target < 0 || target >= plan.value.topics.length) return
  const topics = plan.value.topics
  ;[topics[index], topics[target]] = [topics[target], topics[index]]
}

const removeTopic = (index: number) => {
  if (!plan.value) return
  plan.value.topics.splice(index, 1)
}

const savePlan = async () => {
  if (!plan.value || !canSave.value) return
  if (!subjectId.value) {
    subjectError.value = true
    return
  }
  saving.value = true
  try {
    const topics: AiPlanTopic[] = plan.value.topics.map((tpc) => ({
      title: tpc.title.trim(),
      description: tpc.description?.trim() || undefined,
      difficulty: tpc.difficulty,
      estimatedLessons: tpc.estimatedLessons,
    }))
    const created = await aiSavePlan({
      subjectId: subjectId.value,
      name: plan.value.name.trim(),
      description: plan.value.description?.trim() || undefined,
      topics,
    })
    emits('updateData')
    emits('created', t('syllabuses.aiChat.saved'))
    open.value = false
    router.push(`/syllabuses/${created.id}`)
  } catch (err) {
    console.log(err)
  } finally {
    saving.value = false
  }
}

// Reset conversation whenever the modal is closed.
watch(open, (value) => {
  if (!value) {
    resetChat()
    subjectId.value = undefined
    subjectError.value = false
    saving.value = false
    loading.value = false
  }
})
</script>

<style scoped>
.chat-body {
  min-height: 320px;
  max-height: 52vh;
  overflow-y: auto;
  background: rgba(46, 38, 61, 0.02);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 280px;
  padding: 0 24px;
}

.msg-row {
  display: flex;
  margin-bottom: 12px;
}

.msg-user {
  justify-content: flex-end;
}

.msg-assistant {
  justify-content: flex-start;
}

.msg-bubble {
  max-width: 82%;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 0.9375rem;
  line-height: 1.5;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.bubble-user {
  background: rgb(1, 192, 200);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.bubble-assistant {
  background: #ffffff;
  color: rgba(46, 38, 61, 0.9);
  border: 1px solid rgba(46, 38, 61, 0.12);
  border-bottom-left-radius: 4px;
  white-space: normal;
}

.error-bubble {
  border-color: rgba(211, 47, 47, 0.4);
}

.plan-card {
  max-width: 100%;
  width: 100%;
  background: #ffffff;
}

.plan-table :deep(td),
.plan-table :deep(th) {
  padding: 4px 8px !important;
}

.topic-title-field :deep(.v-field__input) {
  padding-top: 4px;
  padding-bottom: 4px;
  min-height: unset;
  font-size: 0.9375rem;
}

.typing-bubble {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(46, 38, 61, 0.4);
  animation: typing 1.2s infinite ease-in-out;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.18s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}
</style>
