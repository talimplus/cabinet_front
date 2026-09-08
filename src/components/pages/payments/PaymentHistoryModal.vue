<template>
  <v-dialog
    :model-value="modelValue"
    max-width="900"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-title class="pa-4">
        <div class="text-h6">{{ $t('payments.history.title') }}</div>
        <div v-if="payment" class="text-body-2 text-medium-emphasis mt-1">
          {{ studentName }}
          <span v-if="payment.group?.name"> · {{ payment.group.name }}</span>
          <span v-if="payment.forMonth"> · {{ formatMonth(payment.forMonth) }}</span>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-4">
        <div v-if="loading" class="py-8 text-center">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <v-alert v-else-if="error" type="error" variant="tonal" density="comfortable">
          {{ error }}
          <template v-slot:append>
            <v-btn size="small" variant="text" @click="load">{{
              $t('payments.history.retry')
            }}</v-btn>
          </template>
        </v-alert>

        <div v-else-if="receipts.length === 0" class="py-8 text-center">
          <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
          <p class="text-body-1 mt-3 text-medium-emphasis">{{ $t('payments.history.empty') }}</p>
        </div>

        <div v-else class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>{{ $t('payments.history.checkNo') }}</th>
                <th>{{ $t('payments.history.date') }}</th>
                <th>{{ $t('common.amount') }}</th>
                <th>{{ $t('payments.check.paymentMethod') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th>{{ $t('payments.check.receivedBy') }}</th>
                <th>{{ $t('common.comment') }}</th>
                <th class="text-right">{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(receipt, index) in receipts" :key="receipt.receiptId ?? index">
                <td class="font-weight-bold">{{ receipt.checkNo || '—' }}</td>
                <td>{{ formatDateTime(receipt.receivedAt || receipt.createdAt) }}</td>
                <td class="font-weight-bold">{{ formatCurrency(receipt.amount) }}</td>
                <td>{{ methodLabel(receipt.paymentMethod) }}</td>
                <td>
                  <v-chip :color="statusColor(receipt.status)" size="small" variant="flat">
                    {{ statusLabel(receipt.status) }}
                  </v-chip>
                </td>
                <td>{{ receipt.receivedBy?.fullName || '—' }}</td>
                <td class="comment-cell">{{ receipt.comment || '—' }}</td>
                <td class="text-right">
                  <v-tooltip :text="$t('payments.history.printOne')" location="top">
                    <template v-slot:activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        icon="mdi-printer"
                        size="small"
                        variant="text"
                        color="primary"
                        @click="emit('print', [receipt])"
                      ></v-btn>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="font-weight-bold">{{ $t('common.total') }}</td>
                <td class="font-weight-bold">{{ formatCurrency(totalAmount) }}</td>
                <td colspan="5"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)">
          {{ $t('common.close') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-printer"
          :disabled="receipts.length === 0"
          @click="emit('print', receipts)"
        >
          {{ $t('payments.history.printAll') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Payment, PaymentCheck, PaymentMethod } from '@/types/payments.types'
import { fetchPaymentReceipts } from '@/services/pages/payments'

defineOptions({ name: 'PaymentHistoryModal' })

const props = defineProps<{
  modelValue: boolean
  payment: Payment | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'print', checks: PaymentCheck[]): void
}>()

const { t } = useI18n()

const receipts = ref<PaymentCheck[]>([])
const loading = ref(false)
const error = ref('')

const studentName = computed(() =>
  props.payment ? `${props.payment.student.firstName} ${props.payment.student.lastName}` : '',
)

// Jamiga rad etilgan to'lovlar kirmaydi
const totalAmount = computed(() =>
  receipts.value
    .filter((receipt) => receipt.status !== 'rejected')
    .reduce((sum, receipt) => sum + (Number(receipt.amount) || 0), 0),
)

const load = async () => {
  if (!props.payment) return
  loading.value = true
  error.value = ''
  try {
    const data = await fetchPaymentReceipts(props.payment.id)
    receipts.value = (data || []).filter(Boolean)
  } catch (e) {
    console.error('Error loading payment history:', e)
    receipts.value = []
    error.value = t('payments.history.loadError')
  } finally {
    loading.value = false
  }
}

// Modal har ochilganda tarixni qaytadan yuklaymiz (yangi to'lovlar ko'rinishi uchun)
watch(
  () => [props.modelValue, props.payment?.id],
  ([show]) => {
    if (show) load()
  },
)

const methodLabel = (method?: PaymentMethod | null): string => {
  if (!method) return '—'
  const key = `payments.check.method.${method}`
  const label = t(key)
  return label === key ? method : label
}

const statusColor = (status: PaymentCheck['status']): string => {
  if (status === 'confirmed') return 'success'
  if (status === 'rejected') return 'error'
  return 'warning'
}

const statusLabel = (status: PaymentCheck['status']): string =>
  t(`payments.history.status.${status}`)

const formatCurrency = (amount?: number | null): string => {
  const value = Number(amount) || 0
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) +
    ' ' +
    t('common.sum')
  )
}

const formatDateTime = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMonth = (value: string): string => {
  if (!value) return ''
  const date = new Date(value.length === 7 ? `${value}-01` : value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
}
</script>

<style scoped>
.history-table-wrapper {
  overflow-x: auto;
}
.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.history-table th,
.history-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  white-space: nowrap;
}
.history-table th {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  background: rgba(0, 0, 0, 0.02);
}
.history-table tfoot td {
  border-bottom: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.2);
}
.comment-cell {
  max-width: 220px;
  white-space: normal;
}
</style>
