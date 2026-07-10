<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4"> {{ $t('payments.title') }} </v-card-title>

      <!-- Filters -->
      <v-card-text class="pb-2">
        <v-row dense>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              :label="$t('payments.filters.year')"
              hide-details
              variant="outlined"
              density="compact"
              @update:model-value="handleYearChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStatus"
              :items="statusOptions"
              :label="$t('common.status')"
              hide-details
              variant="outlined"
              density="compact"
              clearable
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedCenterId"
              :items="centerOptions"
              item-title="title"
              hide-details
              item-value="value"
              :label="$t('payments.filters.center')"
              variant="outlined"
              density="compact"
              clearable
              :loading="loadingCenters"
              @update:model-value="handleCenterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedGroupId"
              :items="groupOptions"
              :label="$t('payments.filters.group')"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              :loading="loadingGroups"
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="searchQuery"
              :label="$t('common.search')"
              :placeholder="$t('payments.filters.searchPlaceholder')"
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
      <v-tabs
        v-model="selectedMonthIndex"
        bg-color="primary"
        slider-color="white"
        @update:model-value="handleMonthChange"
      >
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
          <p class="text-h6 mt-4 text-medium-emphasis">{{ $t('payments.table.emptyState') }}</p>
        </div>

        <div v-else class="payments-table-wrapper">
          <table class="payments-table">
            <thead>
              <tr>
                <th class="student-column sticky">{{ $t('payments.table.student') }}</th>
                <th>{{ $t('payments.table.group') }}</th>
                <th>{{ $t('payments.table.lessons') }}</th>
                <th>{{ $t('payments.table.amountDue') }}</th>
                <th>{{ $t('payments.table.amountPaid') }}</th>
                <th>{{ $t('payments.table.remaining') }}</th>
                <th>{{ $t('common.status') }}</th>
                <th>{{ $t('payments.table.pendingConfirmation') }}</th>
                <th>{{ $t('payments.table.dueDate') }}</th>
                <th>{{ $t('payments.table.hardDueDate') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="payment in payments"
                :key="payment.id"
                :class="{ 'row-overdue': payment.isOverdue }"
              >
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
                    {{ $t('payments.chips.overdue') }}
                  </v-chip>
                  <v-chip
                    v-if="payment.hasPendingReceipt"
                    color="warning"
                    size="small"
                    variant="flat"
                    class="ml-2"
                  >
                    <v-icon start size="small">mdi-clock-outline</v-icon>
                    {{ $t('payments.chips.pendingAdmin') }}
                  </v-chip>
                </td>
                <td>
                  <div v-if="payment.hasPendingReceipt && payment.pendingReceiptsCount">
                    <div class="d-flex flex-column gap-1">
                      <div class="text-caption text-medium-emphasis">
                        <v-icon size="small" color="warning">mdi-receipt-text-check</v-icon>
                        {{ $t('payments.table.requests', { count: payment.pendingReceiptsCount }) }}
                      </div>
                      <div class="text-body-2 font-weight-bold text-warning">
                        {{ formatCurrency(payment.pendingAmount || 0) }}
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-medium-emphasis">—</span>
                </td>
                <td>{{ formatDate(payment.dueDate) }}</td>
                <td>{{ formatDate(payment.hardDueDate) }}</td>
                <td>
                  <div v-if="payment.status === PaymentStatus.PAID" class="d-flex align-center">
                    <v-icon color="success" size="small">mdi-check-circle</v-icon>
                    <span class="ml-2 text-caption text-medium-emphasis">{{ $t('payments.status.paid') }}</span>
                  </div>
                  <div v-else class="d-flex gap-2">
                    <v-btn
                      color="success"
                      size="small"
                      variant="flat"
                      @click="openMarkAsPaidDialog(payment)"
                      :disabled="processingPayment"
                    >
                      {{ $t('payments.buttons.payFull') }}
                    </v-btn>
                    <v-btn
                      color="primary"
                      size="small"
                      variant="flat"
                      @click="openPartialPaymentModal(payment)"
                      :disabled="processingPayment"
                    >
                      {{ $t('payments.buttons.payPartial') }}
                    </v-btn>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <v-pagination
            v-model="page"
            :length="totalPages"
            class="mt-4"
            @update:model-value="handlePageChange"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <!-- Mark as Paid Confirmation Dialog -->
    <v-dialog v-model="markAsPaidDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> {{ $t('payments.dialog.markTitle') }} </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            {{
              $t('payments.dialog.markConfirm', {
                name: `${markAsPaidDialog.payment?.student.firstName} ${markAsPaidDialog.payment?.student.lastName}`,
              })
            }}
          </p>
          <div class="mt-4">
            <div class="info-row mb-2">
              <span class="info-label">{{ $t('payments.dialog.remainingSum') }}:</span>
              <span class="info-value font-weight-bold">
                {{ formatCurrency(markAsPaidDialog.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="markAsPaidDialog.show = false"
            :disabled="processingPayment"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            @click="confirmMarkAsPaid"
            :loading="processingPayment"
          >
            {{ $t('payments.dialog.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Partial Payment Modal -->
    <v-dialog v-model="partialPaymentModal.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4"> {{ $t('payments.dialog.partialTitle') }} </v-card-title>
        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="info-row mb-3">
              <span class="info-label">{{ $t('payments.dialog.student') }}:</span>
              <span class="info-value">
                {{ partialPaymentModal.payment?.student.firstName }}
                {{ partialPaymentModal.payment?.student.lastName }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">{{ $t('payments.dialog.remainingSum') }}:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(partialPaymentModal.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>

          <!-- Calculator Section -->
          <div class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-medium">{{ $t('payments.dialog.stopStudyDate') }}</span>
              <v-btn
                color="primary"
                size="small"
                variant="flat"
                prepend-icon="mdi-calculator"
                @click="openDatePicker"
                :disabled="partialPaymentModal.calculating"
                :loading="partialPaymentModal.calculating"
              >
                {{ $t('payments.dialog.calculate') }}
              </v-btn>
            </div>
            <v-date-input
              v-if="partialPaymentModal.showDatePicker"
              v-model="partialPaymentModal.plannedStudyUntilDate"
              :label="$t('payments.dialog.selectDate')"
              variant="outlined"
              density="compact"
              @update:model-value="handleDateChange"
              class="mb-2"
            ></v-date-input>
            <v-btn
              v-if="partialPaymentModal.plannedStudyUntilDate"
              size="small"
              variant="text"
              color="error"
              @click="clearDate"
              class="mt-2"
            >
              {{ $t('payments.dialog.clearDate') }}
            </v-btn>
          </div>

          <!-- Calculation Results -->
          <v-card
            v-if="partialPaymentModal.calculation"
            variant="outlined"
            class="mb-4 calculation-results"
          >
            <v-card-title class="text-subtitle-1 pa-3"> {{ $t('payments.dialog.calcResults') }} </v-card-title>
            <v-card-text class="pa-3">
              <div class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.lessonsPlanned') }}:</span>
                <span class="info-value">
                  {{ partialPaymentModal.calculation.lessonsPlanned }}
                </span>
              </div>
              <div class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.lessonsBillable') }}:</span>
                <span class="info-value">
                  {{ partialPaymentModal.calculation.lessonsBillable }}
                </span>
              </div>
              <div class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.discount') }}:</span>
                <span class="info-value">
                  {{ partialPaymentModal.calculation.discountPercent }}%
                </span>
              </div>
              <v-divider class="my-3"></v-divider>
              <div class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.currentAmount') }}:</span>
                <span class="info-value font-weight-medium">
                  {{ formatCurrency(partialPaymentModal.calculation.currentAmountDue) }}
                </span>
              </div>
              <div class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.calculatedAmount') }}:</span>
                <span class="info-value font-weight-medium text-primary">
                  {{ formatCurrency(partialPaymentModal.calculation.amountDue) }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label font-weight-bold">{{ $t('payments.dialog.difference') }}:</span>
                <span
                  class="info-value font-weight-bold"
                  :class="{
                    'text-success': partialPaymentModal.calculation.difference < 0,
                    'text-error': partialPaymentModal.calculation.difference > 0,
                  }"
                >
                  {{ formatCurrency(Math.abs(partialPaymentModal.calculation.difference)) }}
                  <span v-if="partialPaymentModal.calculation.difference < 0"> {{ $t('payments.dialog.refunded') }}</span>
                  <span v-else-if="partialPaymentModal.calculation.difference > 0"> {{ $t('payments.dialog.additional') }}</span>
                </span>
              </div>
            </v-card-text>
          </v-card>

          <v-text-field
            v-model.number="partialPaymentModal.amount"
            :label="$t('payments.dialog.amountLabel')"
            type="number"
            variant="outlined"
            density="compact"
            :min="0.01"
            :max="partialPaymentModal.payment?.remainingAmount || 0"
            :rules="amountRules"
            :suffix="$t('payments.dialog.sumSuffix')"
            :error-messages="amountError"
            :disabled="!!partialPaymentModal.calculation"
            :hint="partialPaymentModal.calculation ? $t('payments.dialog.calcHint') : ''"
            persistent-hint
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closePartialPaymentModal" :disabled="processingPayment">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmPartialPayment"
            :loading="processingPayment"
            :disabled="!canProcessPartialPayment"
          >
            {{ $t('payments.dialog.confirm') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" top>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> {{ $t('common.close') }} </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Payment, PaymentCalculationResponse } from '@/types/payments.types'
import { PaymentStatus } from '@/types/payments.types'
import { fetchPayments, markAsPaid, payPartial, calculatePayment, updatePayment } from '@/services/pages/payments'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'

// Component name
defineOptions({
  name: 'PaymentsPage',
})

const { t } = useI18n()

// State
const selectedYear = ref(new Date().getFullYear())
const selectedMonthIndex = ref(new Date().getMonth())
const selectedStatus = ref<PaymentStatus | 'all' | null>(null)
const selectedGroupId = ref<number | null>(null)
const selectedCenterId = ref<number | null>(null)
const searchQuery = ref('')
const payments = ref<Payment[]>([])
const groups = ref<Group[]>([])
const centers = ref<Center[]>([])
const loading = ref(false)
const loadingGroups = ref(false)
const loadingCenters = ref(false)
const processingPayment = ref(false)
const page = ref(1)
const totalPages = ref(1)

// Dialogs
const markAsPaidDialog = ref({
  show: false,
  payment: null as Payment | null,
})

const partialPaymentModal = ref({
  show: false,
  payment: null as Payment | null,
  amount: 0 as number,
  plannedStudyUntilDate: null as string | null,
  showDatePicker: false as boolean,
  calculation: null as PaymentCalculationResponse | null,
  calculating: false as boolean,
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

const monthNames = computed(() => [
  { label: t('payments.months.jan'), value: '01' },
  { label: t('payments.months.feb'), value: '02' },
  { label: t('payments.months.mar'), value: '03' },
  { label: t('payments.months.apr'), value: '04' },
  { label: t('payments.months.may'), value: '05' },
  { label: t('payments.months.jun'), value: '06' },
  { label: t('payments.months.jul'), value: '07' },
  { label: t('payments.months.aug'), value: '08' },
  { label: t('payments.months.sep'), value: '09' },
  { label: t('payments.months.oct'), value: '10' },
  { label: t('payments.months.nov'), value: '11' },
  { label: t('payments.months.dec'), value: '12' },
])

const availableMonths = computed(() => {
  const months = []
  const maxMonth = selectedYear.value === currentYear.value ? currentMonth.value + 1 : 12

  for (let i = 0; i < maxMonth; i++) {
    months.push(monthNames.value[i])
  }

  return months
})

const statusOptions = computed(() => [
  { title: t('common.all'), value: 'all' },
  { title: t('payments.status.paid'), value: PaymentStatus.PAID },
  { title: t('payments.status.partial'), value: PaymentStatus.PARTIAL },
  { title: t('payments.status.unpaid'), value: PaymentStatus.UNPAID },
])

const groupOptions = computed(() => {
  return groups.value.map((group) => ({
    title: group.name,
    value: group.id,
  }))
})

const centerOptions = computed(() => {
  return centers.value.map((center) => ({
    title: center.name,
    value: center.id,
  }))
})

const selectedMonth = computed(() => {
  return (
    availableMonths.value[selectedMonthIndex.value]?.value ||
    monthNames.value[currentMonth.value].value
  )
})

const remainingAmount = computed(() => {
  return partialPaymentModal.value.payment?.remainingAmount || 0
})

const amountError = computed(() => {
  if (!partialPaymentModal.value.amount) return []
  if (partialPaymentModal.value.amount <= 0) return [t('payments.validation.amountGreaterThanZero')]
  if (partialPaymentModal.value.amount > remainingAmount.value) {
    return [
      t('payments.validation.amountNotExceedWithSum', {
        amount: formatCurrency(remainingAmount.value),
      }),
    ]
  }
  return []
})

const amountRules = [
  (v: number) => v > 0 || t('payments.validation.amountGreaterThanZero'),
  (v: number) =>
    v <= remainingAmount.value ||
    t('payments.validation.amountNotExceed', { amount: formatCurrency(remainingAmount.value) }),
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
    const response = await fetchAllGroups(selectedCenterId.value || undefined)
    groups.value = response.data || []
    // Reset group selection if selected group is not in the new list
    if (selectedGroupId.value && !groups.value.find((g) => g.id === selectedGroupId.value)) {
      selectedGroupId.value = null
    }
  } catch (error: any) {
    console.error('Guruhlarni yuklashda xatolik:', error)
    groups.value = []
  } finally {
    loadingGroups.value = false
  }
}

const loadCenters = async () => {
  loadingCenters.value = true
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !selectedCenterId.value) {
      const defaultCenter = centers.value.find((c) => c.isDefault) || centers.value[0]
      selectedCenterId.value = defaultCenter.id
    }
  } catch (error: any) {
    console.error('Markazlarni yuklashda xatolik:', error)
    centers.value = []
  } finally {
    loadingCenters.value = false
  }
}

const loadPayments = async () => {
  loading.value = true
  try {
    const forMonth = `${selectedYear.value}-${selectedMonth.value}`
    const params: any = { forMonth, page: page.value, perPage: 10 }

    if (selectedStatus.value && selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    if (searchQuery.value && searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }

    if (selectedGroupId.value) {
      params.groupId = selectedGroupId.value
    }

    if (selectedCenterId.value) {
      params.centerId = selectedCenterId.value
    }

    const response = await fetchPayments(params)
    payments.value = response.data || []
    totalPages.value = response.meta?.totalPages || 1
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('payments.messages.loadError'), 'error')
    payments.value = []
  } finally {
    loading.value = false
  }
}

const handleCenterChange = async () => {
  // Reset group selection when center changes
  selectedGroupId.value = null
  page.value = 1
  // Reload groups for the new center
  await loadGroups()
  // Reload payments
  loadPayments()
}

const handleFilterChange = () => {
  page.value = 1
  loadPayments()
}

const handleYearChange = () => {
  // Reset to first available month if current selection is invalid
  if (selectedMonthIndex.value >= availableMonths.value.length) {
    selectedMonthIndex.value = 0
  }
  page.value = 1
  loadPayments()
}

const handleMonthChange = () => {
  page.value = 1
  loadPayments()
}

const handlePageChange = () => {
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
    showSnackbar(t('payments.messages.markSuccess'), 'success')
    markAsPaidDialog.value.show = false
    await loadPayments()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('payments.messages.markError'), 'error')
  } finally {
    processingPayment.value = false
  }
}

const openPartialPaymentModal = (payment: Payment) => {
  partialPaymentModal.value = {
    show: true,
    payment,
    amount: 0,
    plannedStudyUntilDate: null,
    showDatePicker: false,
    calculation: null,
    calculating: false,
  }
}

const closePartialPaymentModal = () => {
  if (processingPayment.value) return
  partialPaymentModal.value = {
    show: false,
    payment: null,
    amount: 0,
    plannedStudyUntilDate: null,
    showDatePicker: false,
    calculation: null,
    calculating: false,
  }
}

const openDatePicker = () => {
  partialPaymentModal.value.showDatePicker = true
}

const clearDate = () => {
  partialPaymentModal.value.plannedStudyUntilDate = null
  partialPaymentModal.value.calculation = null
  partialPaymentModal.value.amount = 0
}

const handleDateChange = async (date: string | null) => {
  if (!date || !partialPaymentModal.value.payment) return
  
  partialPaymentModal.value.calculating = true
  try {
    const calculation = await calculatePayment(partialPaymentModal.value.payment.id, date)
    partialPaymentModal.value.calculation = calculation
    // Auto-fill amount with calculated amount
    partialPaymentModal.value.amount = calculation.amountDue
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('payments.messages.calcError'), 'error')
    partialPaymentModal.value.calculation = null
  } finally {
    partialPaymentModal.value.calculating = false
  }
}

const confirmPartialPayment = async () => {
  if (!partialPaymentModal.value.payment) return

  processingPayment.value = true
  try {
    if (!partialPaymentModal.value.amount || partialPaymentModal.value.amount <= 0) {
      showSnackbar(t('payments.messages.enterValidAmount'), 'error')
      return
    }
    if (partialPaymentModal.value.amount > remainingAmount.value) {
      showSnackbar(t('payments.messages.amountExceeds'), 'error')
      return
    }

    // If plannedStudyUntilDate is set, update payment first
    if (partialPaymentModal.value.plannedStudyUntilDate) {
      await updatePayment(partialPaymentModal.value.payment.id, {
        plannedStudyUntilDate: partialPaymentModal.value.plannedStudyUntilDate,
      })
    }

    await payPartial(partialPaymentModal.value.payment.id, partialPaymentModal.value.amount)
    showSnackbar(
      t('payments.messages.partialSuccess', {
        amount: formatCurrency(partialPaymentModal.value.amount),
      }),
      'success',
    )
    partialPaymentModal.value = {
      show: false,
      payment: null,
      amount: 0,
      plannedStudyUntilDate: null,
      showDatePicker: false,
      calculation: null,
      calculating: false,
    }
    await loadPayments()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('payments.messages.partialError'), 'error')
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
      return t('payments.status.paid')
    case PaymentStatus.PARTIAL:
      return t('payments.status.partial')
    case PaymentStatus.UNPAID:
      return t('payments.status.unpaid')
    default:
      return status
  }
}

const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    ' ' +
    t('common.sum')
  )
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
onMounted(async () => {
  await loadCenters()
  await loadGroups()
  if (selectedCenterId.value) {
    await loadPayments()
  }
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

.calculation-results {
  background-color: rgba(1, 192, 200, 0.05);
}
</style>
