<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4"> To'lovlar </v-card-title>

      <!-- Filters -->
      <v-card-text class="pb-2">
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              label="Yil"
              variant="outlined"
              density="compact"
              @update:model-value="handleYearChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              label="Holat"
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedGroupId"
              :items="groupOptions"
              label="Guruh"
              variant="outlined"
              density="compact"
              clearable
              :loading="loadingGroups"
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              label="Qidirish"
              placeholder="Ism, telefon va hokazo bo'yicha qidirish"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              @update:model-value="handleFilterChange"
              @keyup.enter="handleFilterChange"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Month Tabs -->
      <v-tabs v-model="selectedMonthIndex" bg-color="primary" slider-color="white" @update:model-value="handleMonthChange">
        <v-tab
          v-for="(month, index) in availableMonths"
          :key="month.value"
          :value="index"
          :class="{ 'text-medium-emphasis': isPastMonth(month.value) }"
        >
          {{ month.label }}
        </v-tab>
      </v-tabs>

      <!-- Payments Table -->
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="payments.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-cash-off</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">Bu oy uchun to'lovlar topilmadi</p>
        </div>

        <div v-else class="payments-table-wrapper">
          <table class="payments-table">
            <thead>
              <tr>
                <th class="student-column sticky">O'quvchi</th>
                <th>Guruh</th>
                <th>Darslar</th>
                <th>To'lanishi kerak</th>
                <th>To'langan</th>
                <th>Qolgan</th>
                <th>Holat</th>
                <th>Muddat</th>
                <th>Qat'iy muddat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in payments" :key="payment.id" :class="{ 'row-overdue': payment.isOverdue }">
                <td class="student-column sticky">
                  <div class="student-name">
                    {{ `${payment.student.firstName} ${payment.student.lastName}` }}
                  </div>
                </td>
                <td>{{ payment.group?.name || '—' }}</td>
                <td>
                  <span class="text-body-2">
                    {{ payment.lessonsBillable }} / {{ payment.lessonsPlanned }}
                  </span>
                </td>
                <td>{{ formatCurrency(payment.amountDue) }}</td>
                <td>{{ formatCurrency(payment.amountPaid) }}</td>
                <td :class="{ 'text-error font-weight-bold': payment.remainingAmount > 0 }">
                  {{ formatCurrency(payment.remainingAmount) }}
                </td>
                <td>
                  <v-chip :color="getStatusColor(payment.status)" size="small" variant="flat">
                    {{ getStatusLabel(payment.status) }}
                  </v-chip>
                  <v-chip
                    v-if="payment.isOverdue"
                    color="error"
                    size="small"
                    variant="flat"
                    class="ml-2"
                  >
                    MUDDATI O'TGAN
                  </v-chip>
                </td>
                <td>{{ formatDate(payment.dueDate) }}</td>
                <td>{{ formatDate(payment.hardDueDate) }}</td>
                <td>
                  <div v-if="payment.status === PaymentStatus.PAID" class="d-flex align-center">
                    <v-icon color="success" size="small">mdi-check-circle</v-icon>
                    <span class="ml-2 text-caption text-medium-emphasis">To'langan</span>
                  </div>
                  <div v-else class="d-flex gap-2">
                    <v-btn
                      color="success"
                      size="small"
                      variant="flat"
                      @click="openMarkAsPaidDialog(payment)"
                      :disabled="processingPayment"
                    >
                      To'liq to'lash
                    </v-btn>
                    <v-btn
                      color="primary"
                      size="small"
                      variant="flat"
                      @click="openPartialPaymentModal(payment)"
                      :disabled="processingPayment"
                    >
                      Qisman to'lash
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Mark as Paid Confirmation Dialog -->
    <v-dialog v-model="markAsPaidDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> To'liq to'lashni tasdiqlash </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            <strong>{{ markAsPaidDialog.payment?.student.firstName }} {{ markAsPaidDialog.payment?.student.lastName }}</strong>
            uchun to'lovni to'liq to'langan deb belgilashni tasdiqlaysizmi?
          </p>
          <div class="mt-4">
            <div class="info-row mb-2">
              <span class="info-label">Qolgan summa:</span>
              <span class="info-value font-weight-bold">
                {{ formatCurrency(markAsPaidDialog.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="markAsPaidDialog.show = false" :disabled="processingPayment">
            Bekor qilish
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            @click="confirmMarkAsPaid"
            :loading="processingPayment"
          >
            Tasdiqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Partial Payment Modal -->
    <v-dialog v-model="partialPaymentModal.show" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4"> Qisman to'lov </v-card-title>
        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="info-row mb-3">
              <span class="info-label">O'quvchi:</span>
              <span class="info-value">
                {{ partialPaymentModal.payment?.student.firstName }} {{ partialPaymentModal.payment?.student.lastName }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">Qolgan summa:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(partialPaymentModal.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>

          <v-text-field
            v-model.number="partialPaymentModal.amount"
            label="To'lov miqdori"
            type="number"
            variant="outlined"
            density="compact"
            :min="0.01"
            :max="partialPaymentModal.payment?.remainingAmount || 0"
            :rules="amountRules"
            suffix="so'm"
            :error-messages="amountError"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closePartialPaymentModal" :disabled="processingPayment">
            Bekor qilish
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmPartialPayment"
            :loading="processingPayment"
            :disabled="!canProcessPartialPayment"
          >
            Tasdiqlash
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
import type { Payment } from '@/types/payments.types'
import { PaymentStatus } from '@/types/payments.types'
import { fetchPayments, markAsPaid, payPartial } from '@/services/pages/payments'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'

// Component name
defineOptions({
  name: 'PaymentsPage',
})

// State
const selectedYear = ref(new Date().getFullYear())
const selectedMonthIndex = ref(new Date().getMonth())
const selectedStatus = ref<PaymentStatus | 'all' | null>(null)
const selectedGroupId = ref<number | null>(null)
const searchQuery = ref('')
const payments = ref<Payment[]>([])
const groups = ref<Group[]>([])
const loading = ref(false)
const loadingGroups = ref(false)
const processingPayment = ref(false)

// Dialogs
const markAsPaidDialog = ref({
  show: false,
  payment: null as Payment | null,
})

const partialPaymentModal = ref({
  show: false,
  payment: null as Payment | null,
  amount: 0 as number,
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

// Computed
const currentYear = computed(() => new Date().getFullYear())
const currentMonth = computed(() => new Date().getMonth())

const yearOptions = computed(() => {
  const years = []
  for (let i = currentYear.value - 1; i <= currentYear.value + 1; i++) {
    years.push({ title: i.toString(), value: i })
  }
  return years
})

const monthNames = [
  { label: 'Yan', value: '01' },
  { label: 'Fev', value: '02' },
  { label: 'Mar', value: '03' },
  { label: 'Apr', value: '04' },
  { label: 'May', value: '05' },
  { label: 'Iyun', value: '06' },
  { label: 'Iyul', value: '07' },
  { label: 'Avg', value: '08' },
  { label: 'Sen', value: '09' },
  { label: 'Okt', value: '10' },
  { label: 'Noy', value: '11' },
  { label: 'Dek', value: '12' },
]

const availableMonths = computed(() => {
  const months = []
  const maxMonth = selectedYear.value === currentYear.value ? currentMonth.value + 1 : 12

  for (let i = 0; i < maxMonth; i++) {
    months.push(monthNames[i])
  }

  return months
})

const statusOptions = [
  { title: 'Barchasi', value: 'all' },
  { title: 'To\'langan', value: PaymentStatus.PAID },
  { title: 'Qisman', value: PaymentStatus.PARTIAL },
  { title: 'To\'lanmagan', value: PaymentStatus.UNPAID },
]

const groupOptions = computed(() => {
  return groups.value.map(group => ({
    title: group.name,
    value: group.id,
  }))
})

const selectedMonth = computed(() => {
  return availableMonths.value[selectedMonthIndex.value]?.value || monthNames[currentMonth.value].value
})

const remainingAmount = computed(() => {
  return partialPaymentModal.value.payment?.remainingAmount || 0
})

const amountError = computed(() => {
  if (!partialPaymentModal.value.amount) return []
  if (partialPaymentModal.value.amount <= 0) return ['Miqdor 0 dan katta bo\'lishi kerak']
  if (partialPaymentModal.value.amount > remainingAmount.value) {
    return [`Miqdor qolgan summa ${formatCurrency(remainingAmount.value)} dan oshmasligi kerak`]
  }
  return []
})

const amountRules = [
  (v: number) => v > 0 || 'Miqdor 0 dan katta bo\'lishi kerak',
  (v: number) => v <= remainingAmount.value || `Miqdor ${formatCurrency(remainingAmount.value)} dan oshmasligi kerak`,
]

const canProcessPartialPayment = computed(() => {
  return (
    partialPaymentModal.value.amount > 0 &&
    partialPaymentModal.value.amount <= remainingAmount.value &&
    amountError.value.length === 0
  )
})

// Methods
const isPastMonth = (monthValue: string): boolean => {
  const month = parseInt(monthValue) - 1
  if (selectedYear.value < currentYear.value) return true
  if (selectedYear.value === currentYear.value && month < currentMonth.value) return true
  return false
}

const loadGroups = async () => {
  loadingGroups.value = true
  try {
    const response = await fetchAllGroups()
    groups.value = response.data || []
  } catch (error: any) {
    console.error('Guruhlarni yuklashda xatolik:', error)
    groups.value = []
  } finally {
    loadingGroups.value = false
  }
}

const loadPayments = async () => {
  loading.value = true
  try {
    const forMonth = `${selectedYear.value}-${selectedMonth.value}`
    const params: any = { forMonth }

    if (selectedStatus.value && selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    if (selectedGroupId.value) {
      params.groupId = selectedGroupId.value
    }

    const response = await fetchPayments(params)
    payments.value = response.data || []
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovlarni yuklashda xatolik', 'error')
    payments.value = []
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  loadPayments()
}

const handleYearChange = () => {
  // Reset to first available month if current selection is invalid
  if (selectedMonthIndex.value >= availableMonths.value.length) {
    selectedMonthIndex.value = 0
  }
  loadPayments()
}

const handleMonthChange = () => {
  loadPayments()
}

const openMarkAsPaidDialog = (payment: Payment) => {
  markAsPaidDialog.value = {
    show: true,
    payment,
  }
}

const confirmMarkAsPaid = async () => {
  if (!markAsPaidDialog.value.payment) return

  processingPayment.value = true
  try {
    await markAsPaid(markAsPaidDialog.value.payment.id)
    showSnackbar('To\'lov to\'liq to\'langan deb belgilandi', 'success')
    markAsPaidDialog.value.show = false
    await loadPayments()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovni belgilashda xatolik', 'error')
  } finally {
    processingPayment.value = false
  }
}

const openPartialPaymentModal = (payment: Payment) => {
  partialPaymentModal.value = {
    show: true,
    payment,
    amount: 0,
  }
}

const closePartialPaymentModal = () => {
  if (processingPayment.value) return
  partialPaymentModal.value = {
    show: false,
    payment: null,
    amount: 0,
  }
}

const confirmPartialPayment = async () => {
  if (!partialPaymentModal.value.payment) return

  processingPayment.value = true
  try {
    if (!partialPaymentModal.value.amount || partialPaymentModal.value.amount <= 0) {
      showSnackbar('Iltimos, to\'g\'ri miqdorni kiriting', 'error')
      return
    }
    if (partialPaymentModal.value.amount > remainingAmount.value) {
      showSnackbar('Miqdor qolgan summadan oshmasligi kerak', 'error')
      return
    }

    await payPartial(partialPaymentModal.value.payment.id, partialPaymentModal.value.amount)
    showSnackbar(`${formatCurrency(partialPaymentModal.value.amount)} miqdoridagi qisman to'lov qabul qilindi`, 'success')
    partialPaymentModal.value = {
      show: false,
      payment: null,
      amount: 0,
    }
    await loadPayments()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovni qayta ishlashda xatolik', 'error')
  } finally {
    processingPayment.value = false
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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
}

const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
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
  loadGroups()
  loadPayments()
})
</script>

<style scoped>
.payments-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.payments-table thead {
  background-color: rgba(0, 0, 0, 0.05);
}

.payments-table th,
.payments-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.payments-table th {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.payments-table td {
  font-size: 0.875rem;
}

.student-column {
  min-width: 200px;
  max-width: 200px;
  background-color: white;
}

.student-column.sticky {
  position: sticky;
  left: 0;
  z-index: 10;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.student-name {
  font-weight: 500;
}

.row-overdue {
  background-color: rgba(244, 67, 54, 0.05);
}


.gap-2 {
  gap: 8px;
}

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
