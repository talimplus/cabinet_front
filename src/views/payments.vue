<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4"> To'lovlar </v-card-title>

      <!-- Status Tabs -->
      <v-tabs v-model="activeTab" bg-color="primary" slider-color="white" @update:model-value="handleTabChange">
        <v-tab value="all">Barchasi</v-tab>
        <v-tab value="unpaid">To'lanmagan</v-tab>
        <v-tab value="partial">Qisman</v-tab>
        <v-tab value="paid">To'langan</v-tab>
      </v-tabs>

      <!-- Payments Table -->
      <v-card-text>
        <v-data-table
          :items="payments"
          :headers="headers"
          :loading="loading"
          :items-per-page="params.perPage"
          hide-default-footer
          class="elevation-0"
        >
          <template v-slot:item.student="{ item }">
            {{ `${item.student.firstName} ${item.student.lastName}` }}
          </template>

          <template v-slot:item.group="{ item }">
            {{ item.group?.name || '—' }}
          </template>

          <template v-slot:item.forMonth="{ item }">
            {{ formatMonth(item.forMonth) }}
          </template>

          <template v-slot:item.amountDue="{ item }">
            {{ formatCurrency(item.amountDue) }}
          </template>

          <template v-slot:item.amountPaid="{ item }">
            {{ formatCurrency(item.amountPaid) }}
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" variant="flat">
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.actions="{ item }">
            <div v-if="item.status === PaymentStatus.PAID" class="d-flex align-center">
              <v-icon color="success" size="small">mdi-check-circle</v-icon>
              <span class="ml-2 text-caption text-medium-emphasis">To'langan</span>
            </div>
            <v-btn
              v-else
              color="primary"
              size="small"
              variant="flat"
              @click="openPaymentModal(item)"
              :disabled="processingPayment"
            >
              {{ item.status === PaymentStatus.UNPAID ? 'To\'lash' : 'Qo\'shimcha to\'lash' }}
            </v-btn>
          </template>
        </v-data-table>

        <!-- Pagination -->
        <div v-if="meta.totalPages > 1" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="params.page"
            :length="meta.totalPages"
            :total-visible="7"
            @update:model-value="loadPayments"
          ></v-pagination>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && payments.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-cash-off</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">To'lovlar topilmadi</p>
          <p class="text-body-2 text-medium-emphasis">Tanlangan filtrga mos to'lovlar mavjud emas.</p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Payment Modal -->
    <v-dialog v-model="paymentModal.show" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4"> To'lov ma'lumotlari </v-card-title>

        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="info-row mb-3">
              <span class="info-label">O'quvchi:</span>
              <span class="info-value">
                {{ paymentModal.payment?.student.firstName }} {{ paymentModal.payment?.student.lastName }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">Guruh:</span>
              <span class="info-value">{{ paymentModal.payment?.group?.name || '—' }}</span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">Oy:</span>
              <span class="info-value">{{ formatMonth(paymentModal.payment?.forMonth || '') }}</span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">To'lanishi kerak:</span>
              <span class="info-value font-weight-bold">{{ formatCurrency(paymentModal.payment?.amountDue || 0) }}</span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">To'langan:</span>
              <span class="info-value">{{ formatCurrency(paymentModal.payment?.amountPaid || 0) }}</span>
            </div>
            <v-divider class="my-4"></v-divider>
            <div class="info-row">
              <span class="info-label">Qolgan:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(remainingAmount) }}
              </span>
            </div>
          </div>

          <!-- Payment Mode Selection -->
          <div v-if="paymentModal.payment?.status === PaymentStatus.UNPAID" class="mb-4">
            <v-radio-group v-model="paymentModal.mode" inline>
              <v-radio label="To'liq to'lash" value="full"></v-radio>
              <v-radio label="Qisman to'lash" value="partial"></v-radio>
            </v-radio-group>
          </div>

          <!-- Partial Payment Input -->
          <div v-if="paymentModal.mode === 'partial' || paymentModal.payment?.status === PaymentStatus.PARTIAL" class="mb-2">
            <v-text-field
              v-model.number="paymentModal.amount"
              label="To'lov miqdori"
              type="number"
              variant="outlined"
              density="compact"
              :min="0.01"
              :max="remainingAmount"
              :rules="amountRules"
              suffix="so'm"
              :error-messages="amountError"
            ></v-text-field>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closePaymentModal" :disabled="processingPayment"> Bekor qilish </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="processPayment"
            :loading="processingPayment"
            :disabled="!canProcessPayment"
          >
            {{ getPaymentButtonText() }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> Yopish </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Payment, PaymentsParams, PaymentsResponse } from '@/types/payments.types'
import { PaymentStatus } from '@/types/payments.types'
import { fetchPayments, markAsPaid, payPartial } from '@/services/pages/payments'

// Component name
defineOptions({
  name: 'PaymentsView',
})

// State
const activeTab = ref('all')
const loading = ref(false)
const processingPayment = ref(false)
const payments = ref<Payment[]>([])
const meta = ref({
  total: 0,
  page: 1,
  perPage: 10,
  totalPages: 0,
})

const params = ref<PaymentsParams>({
  page: 1,
  perPage: 10,
  status: 'all',
})

// Payment Modal
const paymentModal = ref({
  show: false,
  payment: null as Payment | null,
  mode: 'full' as 'full' | 'partial',
  amount: 0 as number,
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const remainingAmount = computed(() => {
  if (!paymentModal.value.payment) return 0
  return paymentModal.value.payment.amountDue - paymentModal.value.payment.amountPaid
})

const amountError = computed(() => {
  if (!paymentModal.value.amount) return []
  if (paymentModal.value.amount <= 0) return ['Miqdor 0 dan katta bo\'lishi kerak']
  if (paymentModal.value.amount > remainingAmount.value) {
    return [`Miqdor qolgan summa ${formatCurrency(remainingAmount.value)} dan oshmasligi kerak`]
  }
  return []
})

const amountRules = [
  (v: number) => v > 0 || 'Miqdor 0 dan katta bo\'lishi kerak',
  (v: number) => v <= remainingAmount.value || `Miqdor ${formatCurrency(remainingAmount.value)} dan oshmasligi kerak`,
]

const canProcessPayment = computed(() => {
  if (paymentModal.value.mode === 'full') return true
  if (paymentModal.value.mode === 'partial') {
    return (
      paymentModal.value.amount > 0 &&
      paymentModal.value.amount <= remainingAmount.value &&
      amountError.value.length === 0
    )
  }
  return false
})

// Table headers
const headers = [
  { title: 'O\'quvchi', key: 'student' },
  { title: 'Guruh', key: 'group' },
  { title: 'Oy', key: 'forMonth' },
  { title: 'To\'lanishi kerak', key: 'amountDue', align: 'end' },
  { title: 'To\'langan', key: 'amountPaid', align: 'end' },
  { title: 'Holat', key: 'status' },
  { title: 'Amallar', key: 'actions', sortable: false },
]

// Methods
const loadPayments = async () => {
  loading.value = true
  try {
    const statusParam = activeTab.value === 'all' ? undefined : (activeTab.value as PaymentStatus)
    const response = await fetchPayments({
      ...params.value,
      status: statusParam,
    })
    payments.value = response.data
    meta.value = response.meta
    params.value.page = response.meta.page
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovlarni yuklashda xatolik', 'error')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  params.value.page = 1
  loadPayments()
}

const openPaymentModal = (payment: Payment) => {
  paymentModal.value = {
    show: true,
    payment,
    mode: payment.status === PaymentStatus.PARTIAL ? 'partial' : 'full',
    amount: 0,
  }
}

const closePaymentModal = () => {
  if (processingPayment.value) return
  paymentModal.value = {
    show: false,
    payment: null,
    mode: 'full',
    amount: 0,
  }
}

const processPayment = async () => {
  if (!paymentModal.value.payment) return

  processingPayment.value = true
  try {
    if (paymentModal.value.mode === 'full') {
      await markAsPaid(paymentModal.value.payment.id)
      showSnackbar('To\'lov to\'liq to\'langan deb belgilandi', 'success')
    } else {
      if (!paymentModal.value.amount || paymentModal.value.amount <= 0) {
        showSnackbar('Iltimos, to\'g\'ri miqdorni kiriting', 'error')
        return
      }
      if (paymentModal.value.amount > remainingAmount.value) {
        showSnackbar('Miqdor qolgan summadan oshmasligi kerak', 'error')
        return
      }
      await payPartial(paymentModal.value.payment.id, paymentModal.value.amount)
      showSnackbar(`${formatCurrency(paymentModal.value.amount)} miqdoridagi qisman to'lov qabul qilindi`, 'success')
    }

    closePaymentModal()
    await loadPayments()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovni qayta ishlashda xatolik', 'error')
  } finally {
    processingPayment.value = false
  }
}

const getPaymentButtonText = (): string => {
  if (paymentModal.value.mode === 'full') return 'To\'liq to\'lash'
  return 'To\'lovni tasdiqlash'
}

const getStatusLabel = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'To\'langan'
    case PaymentStatus.PARTIAL:
      return 'Qisman'
    case PaymentStatus.UNPAID:
      return 'To\'lanmagan'
    default:
      return status
  }
}

const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'success'
    case PaymentStatus.PARTIAL:
      return 'warning'
    case PaymentStatus.UNPAID:
      return 'error'
    default:
      return 'grey'
  }
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
}

const formatMonth = (dateString: string): string => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  const months = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ]
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

const showSnackbar = (message: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color,
  }
}

// Lifecycle
onMounted(() => {
  loadPayments()
})
</script>

<style scoped>
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  font-size: 0.875rem;
}

.info-value {
  color: rgba(0, 0, 0, 0.87);
  font-size: 1rem;
}
</style>

