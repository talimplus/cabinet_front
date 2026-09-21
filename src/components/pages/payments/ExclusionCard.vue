<template>
  <!-- Chiqarib tashlash alohida ruxsat talab qiladi: payments.exclusion -->
  <v-card v-if="canManageExclusion" variant="outlined" class="mb-4">
    <v-card-text class="pa-3">
      <div class="text-body-2 font-weight-medium mb-2">
        {{ $t('payments.exclusion.title') }}
      </div>
      <v-btn-toggle
        :model-value="mode"
        @update:model-value="setMode"
        color="primary"
        density="compact"
        variant="outlined"
        divided
        class="mb-3"
        :disabled="disabled"
      >
        <v-btn value="lessons" size="small">{{ $t('payments.exclusion.byLessons') }}</v-btn>
        <v-btn value="amount" size="small">{{ $t('payments.exclusion.byAmount') }}</v-btn>
      </v-btn-toggle>

      <v-text-field
        v-if="mode === 'lessons'"
        v-model.number="excludeLessons"
        :label="$t('payments.exclusion.excludeLessons')"
        type="number"
        :min="0"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3"
        :disabled="disabled"
        @update:model-value="runPreview"
      ></v-text-field>

      <v-text-field
        v-if="mode === 'amount'"
        v-model.number="excludeAmount"
        :label="$t('payments.exclusion.excludeAmount')"
        type="number"
        :min="0"
        variant="outlined"
        density="compact"
        :suffix="$t('payments.dialog.sumSuffix')"
        hide-details
        class="mb-3"
        :disabled="disabled"
        @update:model-value="runPreview"
      ></v-text-field>

      <!-- Chiqarib tashlash bo'lsa comment majburiy -->
      <v-textarea
        v-if="active"
        v-model="comment"
        :label="$t('payments.exclusion.comment')"
        rows="2"
        variant="outlined"
        density="compact"
        auto-grow
        :error-messages="commentError"
        hide-details="auto"
        class="mb-2"
        :disabled="disabled"
        @update:model-value="emitChange"
      ></v-textarea>

      <!-- Jonli hisob natijasi -->
      <div v-if="active" class="mt-2">
        <div v-if="previewing" class="text-caption text-medium-emphasis">
          {{ $t('payments.exclusion.calculating') }}
        </div>
        <template v-else-if="preview">
          <div class="info-row mb-1">
            <span class="info-label">{{ $t('payments.exclusion.excludedAmount') }}:</span>
            <span class="info-value text-warning">
              − {{ formatCurrency(preview.excludedAmount) }}
            </span>
          </div>
          <div class="info-row mb-1">
            <span class="info-label">{{ $t('payments.exclusion.newAmountDue') }}:</span>
            <span class="info-value font-weight-medium">
              {{ formatCurrency(preview.newAmountDue) }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label font-weight-bold"
              >{{ $t('payments.exclusion.newRemaining') }}:</span
            >
            <span class="info-value font-weight-bold text-primary">
              {{ formatCurrency(preview.newRemaining) }}
            </span>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  Payment,
  ExclusionChange,
  ExclusionPreviewResponse,
} from '@/types/payments.types'
import { previewExclusion } from '@/services/pages/payments'
import { useDebounceFn } from '@/composables/useDebounceFn'

const { canManageExclusion } = usePermissions()

defineOptions({
  name: 'ExclusionCard',
})

const props = defineProps<{
  payment: Payment | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'change', value: ExclusionChange): void
  // Faqat yangi hisob kelganda chiqadi — parent to'lov summasini shunda to'ldiradi
  (e: 'preview', value: ExclusionPreviewResponse): void
  (e: 'error', message: string): void
}>()

const { t } = useI18n()

const mode = ref<null | 'lessons' | 'amount'>(null)
const excludeLessons = ref<number | null>(null)
const excludeAmount = ref<number | null>(null)
const comment = ref('')
const preview = ref<ExclusionPreviewResponse | null>(null)
const previewing = ref(false)

// Chiqarib tashlash kiritilganmi (tanlangan rejimga mos qiymat > 0)
const active = computed(() => {
  if (mode.value === 'lessons') return (excludeLessons.value || 0) > 0
  if (mode.value === 'amount') return (excludeAmount.value || 0) > 0
  return false
})

// Chiqarib tashlashda comment majburiy
const commentError = computed<string[]>(() =>
  active.value && !comment.value.trim() ? [t('payments.exclusion.commentRequired')] : [],
)

const currentPayload = () => {
  if (!active.value) return null
  const trimmed = comment.value.trim()
  return mode.value === 'lessons'
    ? { excludeLessons: excludeLessons.value || 0, comment: trimmed }
    : { excludeAmount: excludeAmount.value || 0, comment: trimmed }
}

const emitChange = () => {
  emit('change', {
    active: active.value,
    payload: currentPayload(),
    preview: preview.value,
    valid: commentError.value.length === 0,
    previewing: previewing.value,
  })
}

// Rejimni tanlash (boshqa rejim inputini tozalaymiz)
const setMode = (value: 'lessons' | 'amount' | null | undefined) => {
  mode.value = value ?? null
  excludeLessons.value = null
  excludeAmount.value = null
  preview.value = null
  if (!value) comment.value = ''
  runPreview()
}

// Kiritilgan chiqarib tashlashni jonli hisoblash (preview-exclusion, debounce bilan)
const fetchPreview = useDebounceFn(async () => {
  const payment = props.payment
  if (!payment || !active.value) return
  try {
    const payload =
      mode.value === 'lessons'
        ? { excludeLessons: excludeLessons.value || 0 }
        : { excludeAmount: excludeAmount.value || 0 }
    preview.value = await previewExclusion(payment.id, payload)
    emit('preview', preview.value)
  } catch (error: any) {
    preview.value = null
    emit('error', error.response?.data?.message || t('payments.messages.calcError'))
  } finally {
    previewing.value = false
    emitChange()
  }
})

const runPreview = () => {
  if (!props.payment || !active.value) {
    preview.value = null
    previewing.value = false
    emitChange()
    return
  }
  // Preview kelguncha parent "hisoblanmoqda" holatini bilib tursin
  previewing.value = true
  emitChange()
  fetchPreview()
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) +
  ' ' +
  t('common.sum')
</script>

<style scoped>
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-label {
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.875rem;
}

.info-value {
  font-size: 0.875rem;
}
</style>
