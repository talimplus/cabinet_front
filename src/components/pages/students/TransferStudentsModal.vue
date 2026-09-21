<template>
  <v-dialog
    :model-value="modelValue"
    max-width="760"
    scrollable
    persistent
    @update:model-value="close"
  >
    <v-card>
      <v-card-title class="pa-4">
        <div class="text-h6">{{ $t('students.transfer.title') }}</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          {{ $t('students.transfer.subtitle', { count: studentIds.length }) }}
          <span v-if="fromGroupName"> · {{ fromGroupName }}</span>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <!-- Natija ko'rsatilayotgan bo'lsa -->
        <div v-if="result">
          <v-alert type="success" variant="tonal" density="comfortable" class="mb-4">
            {{ $t('students.transfer.done', { count: result.transferred }) }}
          </v-alert>

          <table class="transfer-table">
            <thead>
              <tr>
                <th>{{ $t('students.transfer.student') }}</th>
                <th class="text-right">{{ $t('students.transfer.carriedOver') }}</th>
                <th class="text-right">{{ $t('students.transfer.refunded') }}</th>
                <th class="text-right">{{ $t('students.transfer.remainingDebt') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in result.results" :key="row.studentId">
                <td>{{ row.firstName }} {{ row.lastName }}</td>
                <td class="text-right">
                  <span :class="row.carriedOverAmount > 0 ? 'text-success' : 'text-medium-emphasis'">
                    {{ formatCurrency(row.carriedOverAmount) }}
                  </span>
                </td>
                <td class="text-right">
                  <span :class="row.refundedAmount > 0 ? 'text-warning' : 'text-medium-emphasis'">
                    {{ formatCurrency(row.refundedAmount) }}
                  </span>
                </td>
                <td class="text-right">
                  <span :class="row.remainingDebtInSourceGroup > 0 ? 'text-error' : 'text-medium-emphasis'">
                    {{ formatCurrency(row.remainingDebtInSourceGroup) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <p class="text-caption text-medium-emphasis mt-3 mb-0">
            {{ $t('students.transfer.doneHint') }}
          </p>
        </div>

        <!-- Forma -->
        <div v-else>
          <v-select
            v-model="toGroupId"
            :items="targetGroups"
            item-title="name"
            item-value="id"
            :label="$t('students.transfer.toGroup')"
            variant="outlined"
            density="comfortable"
            :loading="loadingGroups"
            :error-messages="toGroupError"
            class="mb-1"
          ></v-select>

          <v-text-field
            v-model="transferDate"
            type="date"
            :label="$t('students.transfer.date')"
            :hint="$t('students.transfer.dateHint')"
            persistent-hint
            variant="outlined"
            density="comfortable"
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="reason"
            :label="$t('students.transfer.reason')"
            variant="outlined"
            density="comfortable"
            rows="2"
            auto-grow
            class="mb-2"
          ></v-textarea>

          <v-checkbox
            v-if="allowCloseSourceGroup"
            v-model="closeSourceGroup"
            :label="$t('students.transfer.closeSourceGroup')"
            :hint="$t('students.transfer.closeSourceGroupHint')"
            persistent-hint
            density="compact"
            class="mb-3"
          ></v-checkbox>

          <!-- Ko'chirishdan oldingi holat -->
          <div v-if="loadingPreview" class="py-4 text-center">
            <v-progress-circular indeterminate size="28" color="primary"></v-progress-circular>
          </div>

          <template v-else-if="preview.length">
            <v-alert
              v-if="totalDebt > 0"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ $t('students.transfer.debtWarning', { amount: formatCurrency(totalDebt) }) }}
            </v-alert>

            <v-alert
              v-if="totalOverpaid > 0"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-3"
            >
              {{ $t('students.transfer.overpaidNotice', { amount: formatCurrency(totalOverpaid) }) }}
            </v-alert>

            <table v-if="rowsWithMoney.length" class="transfer-table">
              <thead>
                <tr>
                  <th>{{ $t('students.transfer.student') }}</th>
                  <th class="text-right">{{ $t('students.transfer.debt') }}</th>
                  <th class="text-right">{{ $t('students.transfer.overpaid') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in rowsWithMoney" :key="row.studentId">
                  <td>{{ row.firstName }} {{ row.lastName }}</td>
                  <td class="text-right">
                    <span :class="row.debt > 0 ? 'text-error' : 'text-medium-emphasis'">
                      {{ formatCurrency(row.debt) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <span :class="row.overpaid > 0 ? 'text-info' : 'text-medium-emphasis'">
                      {{ formatCurrency(row.overpaid) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </template>

          <v-alert type="info" variant="tonal" density="compact" class="mt-3 mb-0">
            {{ $t('students.transfer.billingHint') }}
          </v-alert>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="close">
          {{ result ? $t('common.close') : $t('common.cancel') }}
        </v-btn>
        <v-btn
          v-if="!result"
          color="primary"
          variant="flat"
          :loading="submitting"
          :disabled="!toGroupId"
          @click="submit"
        >
          {{ $t('students.transfer.submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { fetchAllGroups } from '@/services/pages/groups'
import { previewTransferStudents, transferStudents } from '@/services/pages/students'
import type {
  TransferPreviewRow,
  TransferStudentsResponse,
} from '@/types/students.types'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'

defineOptions({ name: 'TransferStudentsModal' })

const props = defineProps<{
  modelValue: boolean
  studentIds: number[]
  fromGroupId: number
  fromGroupName?: string | null
  /** Guruh sahifasidan ochilganda eski guruhni yopish imkoniyati ko'rsatiladi. */
  allowCloseSourceGroup?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'transferred', value: TransferStudentsResponse): void
}>()

const { t } = useI18n()
const notify = useNotificationStore()

const toGroupId = ref<number | null>(null)
const toGroupError = ref<string>('')
const transferDate = ref<string>(dayjs().format('YYYY-MM-DD'))
const reason = ref<string>('')
const closeSourceGroup = ref(false)

const groups = ref<Array<{ id: number; name: string; status?: string }>>([])
const loadingGroups = ref(false)
const preview = ref<TransferPreviewRow[]>([])
const loadingPreview = ref(false)
const submitting = ref(false)
const result = ref<TransferStudentsResponse | null>(null)

// Tugagan guruhga va o'zining guruhiga ko'chirib bo'lmaydi.
const targetGroups = computed(() =>
  groups.value.filter((g) => g.id !== props.fromGroupId && g.status !== 'finished')
)

const rowsWithMoney = computed(() =>
  preview.value.filter((r) => r.debt > 0 || r.overpaid > 0)
)
const totalDebt = computed(() =>
  preview.value.reduce((sum, r) => sum + Number(r.debt || 0), 0)
)
const totalOverpaid = computed(() =>
  preview.value.reduce((sum, r) => sum + Number(r.overpaid || 0), 0)
)

const formatCurrency = (value: number | string | null | undefined): string => {
  const num = Number(value ?? 0)
  return `${new Intl.NumberFormat('uz-UZ').format(Math.round(num))} so'm`
}

const loadGroups = async () => {
  loadingGroups.value = true
  try {
    const response = await fetchAllGroups()
    groups.value = response.data ?? []
  } catch (error) {
    console.error('Failed to load groups:', error)
  } finally {
    loadingGroups.value = false
  }
}

const loadPreview = async () => {
  if (!props.studentIds.length || !props.fromGroupId) return
  loadingPreview.value = true
  try {
    const response = await previewTransferStudents({
      studentIds: props.studentIds,
      fromGroupId: props.fromGroupId,
    })
    preview.value = response.data ?? []
  } catch (error) {
    // Preview — qo'shimcha ma'lumot; muvaffaqiyatsiz bo'lsa ko'chirishni to'smaymiz.
    preview.value = []
    console.error('Failed to load transfer preview:', error)
  } finally {
    loadingPreview.value = false
  }
}

const reset = () => {
  toGroupId.value = null
  toGroupError.value = ''
  transferDate.value = dayjs().format('YYYY-MM-DD')
  reason.value = ''
  closeSourceGroup.value = false
  preview.value = []
  result.value = null
}

const close = () => {
  emit('update:modelValue', false)
}

const submit = async () => {
  if (!toGroupId.value) {
    toGroupError.value = t('students.transfer.toGroupRequired')
    return
  }
  toGroupError.value = ''
  submitting.value = true
  try {
    const response = await transferStudents({
      studentIds: props.studentIds,
      fromGroupId: props.fromGroupId,
      toGroupId: toGroupId.value,
      transferDate: transferDate.value || undefined,
      reason: reason.value.trim() || undefined,
      closeSourceGroup: props.allowCloseSourceGroup ? closeSourceGroup.value : undefined,
    })
    result.value = response.data
    notify.success(t('students.transfer.done', { count: response.data.transferred }))
    emit('transferred', response.data)
  } catch (error) {
    notify.error(apiErrorMessage(error))
  } finally {
    submitting.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    reset()
    loadGroups()
    loadPreview()
  }
)
</script>

<style scoped>
.transfer-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.transfer-table th,
.transfer-table td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  text-align: left;
}

.transfer-table th {
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
}

.transfer-table .text-right {
  text-align: right;
}
</style>
