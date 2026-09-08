<template>
  <v-dialog
    :model-value="modelValue"
    max-width="480"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <v-card-text class="pa-4">
        <div ref="printArea">
          <div
            v-for="(check, index) in checks"
            :key="(check.receiptId ?? check.checkNo ?? '') + '-' + index"
            class="check"
            :class="{ 'mt-6': index > 0 }"
          >
            <!-- Yuqori qism: markaz nomi + katta chek raqami -->
            <div class="check-header">
              <div class="check-brand">{{ brandName }}</div>
              <div class="check-no">
                {{ $t('payments.check.number') }} {{ check.checkNo || '—' }}
              </div>
              <div v-if="check.status === 'pending'" class="check-pending">
                {{ $t('payments.check.pending') }}
              </div>
            </div>

            <!-- Jadval ko'rinishidagi ma'lumotlar -->
            <table class="check-table">
              <tbody>
                <tr>
                  <td class="k">{{ $t('payments.check.fullName') }}</td>
                  <td class="v">{{ check.student?.fullName || '—' }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.phone') }}</td>
                  <td class="v">{{ check.student?.phone || '—' }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.group') }}</td>
                  <td class="v">{{ check.group?.name || '—' }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.teacher') }}</td>
                  <td class="v">{{ check.teacher?.fullName || '—' }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.month') }}</td>
                  <td class="v">{{ check.forMonth || '—' }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.paymentMethod') }}</td>
                  <td class="v">
                    {{ methodLabel(check.paymentMethod) }}
                    <span v-if="check.paidAt" class="text-medium-emphasis">
                      · {{ $t('payments.check.paidAtLabel') }}: {{ check.paidAt }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.balanceBefore') }}</td>
                  <td class="v">{{ formatCurrency(check.balanceBefore) }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.balanceAfter') }}</td>
                  <td class="v">{{ formatCurrency(check.balanceAfter) }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.dateTime') }}</td>
                  <td class="v">{{ formatDateTime(check.createdAt) }}</td>
                </tr>
                <tr>
                  <td class="k">{{ $t('payments.check.receivedBy') }}</td>
                  <td class="v">{{ check.receivedBy?.fullName || '—' }}</td>
                </tr>
                <tr v-if="check.transactionNo">
                  <td class="k">{{ $t('payments.check.transactionNo') }}</td>
                  <td class="v">{{ check.transactionNo }}</td>
                </tr>
              </tbody>
            </table>

            <!-- To'lov summasi — chekning eng pastida, qolganlaridan ajratilgan holda -->
            <div class="check-total">
              <span class="check-total-label">{{ $t('payments.check.amount') }}</span>
              <span class="check-total-value">{{ formatCurrency(check.amount) }}</span>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="emit('update:modelValue', false)">
          {{ $t('payments.check.close') }}
        </v-btn>
        <v-btn color="primary" variant="flat" prepend-icon="mdi-printer" @click="printChecks">
          {{ $t('payments.check.print') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PaymentCheck, PaymentMethod } from '@/types/payments.types'

defineOptions({ name: 'PaymentCheckModal' })

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    checks: PaymentCheck[]
    brandName?: string
  }>(),
  {
    brandName: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { t } = useI18n()
const printArea = ref<HTMLElement | null>(null)

const brandName = props.brandName || t('payments.check.title')

const methodLabel = (method?: PaymentMethod | null): string => {
  if (!method) return '—'
  const key = `payments.check.method.${method}`
  const label = t(key)
  return label === key ? method : label
}

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

// Chekni alohida iframe orqali chop etamiz — sahifa stillari aralashmaydi
const printChecks = () => {
  if (!printArea.value) return
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${brandName}</title>
    <style>${printStyles}</style></head>
    <body>${printArea.value.innerHTML}</body></html>`)
  doc.close()

  const win = iframe.contentWindow
  if (!win) {
    document.body.removeChild(iframe)
    return
  }
  // Kontent tayyor bo'lgach chop etamiz, so'ng iframe'ni olib tashlaymiz
  win.focus()
  win.print()
  setTimeout(() => {
    document.body.removeChild(iframe)
  }, 500)
}

// Chop etiladigan chek stillari (iframe ichida qo'llanadi)
const printStyles = `
  * { box-sizing: border-box; }
  body { font-family: Arial, "Helvetica Neue", sans-serif; margin: 0; padding: 16px; color: #000; }
  .check { max-width: 320px; margin: 0 auto 24px; padding-bottom: 12px; }
  .check + .check { border-top: 1px dashed #999; padding-top: 16px; }
  .check-header { text-align: center; margin-bottom: 12px; border-bottom: 1px solid #000; padding-bottom: 8px; }
  .check-brand { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
  .check-no { font-size: 26px; font-weight: 800; margin-top: 4px; }
  .check-pending { margin-top: 6px; font-size: 12px; font-weight: 700; color: #b26a00; }
  .check-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .check-table td { padding: 5px 4px; vertical-align: top; border-bottom: 1px dotted #ccc; }
  .check-table td.k { color: #555; white-space: nowrap; padding-right: 12px; }
  .check-table td.v { text-align: right; font-weight: 600; }
  .check-table tr:last-child td { border-bottom: 0; }
  .check-total { display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
    margin-top: 14px; padding-top: 10px; border-top: 1px solid #000; }
  .check-total-label { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
  .check-total-value { font-size: 18px; font-weight: 800; text-align: right; white-space: nowrap; }
`
</script>

<style scoped>
.check {
  max-width: 360px;
  margin: 0 auto;
}
.check-header {
  text-align: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.87);
  padding-bottom: 8px;
}
.check-brand {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.check-no {
  font-size: 1.75rem;
  font-weight: 800;
  margin-top: 4px;
}
.check-pending {
  margin-top: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #b26a00;
}
.check-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.check-table td {
  padding: 6px 4px;
  vertical-align: top;
  border-bottom: 1px dotted rgba(0, 0, 0, 0.15);
}
.check-table td.k {
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  padding-right: 12px;
}
.check-table td.v {
  text-align: right;
  font-weight: 600;
}
.check-table tr:last-child td {
  border-bottom: 0;
}
.check-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.87);
}
.check-total-label {
  font-size: 0.8125rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.check-total-value {
  font-size: 1.125rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}
</style>
