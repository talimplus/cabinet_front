<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4"> Ish haqi </v-card-title>

      <!-- Year & Month Navigation -->
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

      <!-- Staff Salaries Table -->
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="staffSalaries.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-cash-off</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">Bu oy uchun ish haqi ma'lumotlari topilmadi</p>
        </div>

        <div v-else class="payroll-table-wrapper">
          <table class="payroll-table">
            <thead>
              <tr>
                <th>Ishchi</th>
                <th>Rol</th>
                <th>Asosiy maosh</th>
                <th v-if="hasTeachers">Komissiya</th>
                <th>Jami maosh</th>
                <th>To'langan</th>
                <th>Qolgan</th>
                <th>Holat</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="staff in staffSalaries"
                :key="staff.id"
                :class="{
                  'row-unpaid': staff.status === PayrollStatus.UNPAID,
                  'row-partial': staff.status === PayrollStatus.PARTIAL,
                  'row-paid': staff.status === PayrollStatus.PAID,
                }"
              >
                <td>
                  <div class="staff-name">
                    {{ `${staff.user.firstName} ${staff.user.lastName}` }}
                  </div>
                </td>
                <td>{{ getRoleLabel(staff.user.role) }}</td>
                <td>{{ formatCurrency(getBaseSalary(staff)) }}</td>
                <td v-if="hasTeachers">
                  <span v-if="staff.user.role === 'teacher' && getCommissionAmount(staff)">
                    {{ formatCurrency(getCommissionAmount(staff)) }}
                  </span>
                  <span v-else class="text-medium-emphasis">—</span>
                </td>
                <td class="font-weight-bold">{{ formatCurrency(getTotalSalary(staff)) }}</td>
                <td>{{ formatCurrency(staff.paidAmount) }}</td>
                <td :class="{ 'text-error font-weight-bold': getRemainingAmount(staff) > 0 }">
                  {{ formatCurrency(getRemainingAmount(staff)) }}
                </td>
                <td>
                  <v-chip :color="getStatusColor(staff.status)" size="small" variant="flat">
                    {{ getStatusLabel(staff.status) }}
                  </v-chip>
                </td>
                <td>
                  <v-btn
                    v-if="staff.status !== PayrollStatus.PAID"
                    color="primary"
                    size="small"
                    variant="flat"
                    @click="openPaymentModal(staff)"
                    :disabled="processingPayment"
                  >
                    To'lash
                  </v-btn>
                  <span v-else class="text-caption text-medium-emphasis">To'langan</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Payment Modal -->
    <v-dialog v-model="paymentModal.show" max-width="500" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4"> To'lov </v-card-title>
        <v-card-text class="pa-4">
          <div class="mb-4">
            <div class="info-row mb-3">
              <span class="info-label">Ishchi:</span>
              <span class="info-value">
                {{ paymentModal.staff?.user.firstName }} {{ paymentModal.staff?.user.lastName }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">Jami maosh:</span>
              <span class="info-value font-weight-bold">
                {{ formatCurrency(paymentModal.staff ? getTotalSalary(paymentModal.staff) : 0) }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">To'langan:</span>
              <span class="info-value">
                {{ formatCurrency(paymentModal.staff?.paidAmount || 0) }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">Qolgan summa:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(remainingAmount) }}
              </span>
            </div>
          </div>

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
            class="mb-3"
          ></v-text-field>

          <v-textarea
            v-model="paymentModal.comment"
            label="Izoh (ixtiyoriy)"
            variant="outlined"
            density="compact"
            rows="3"
            counter
            maxlength="500"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closePaymentModal" :disabled="processingPayment">
            Bekor qilish
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="confirmPayment"
            :loading="processingPayment"
            :disabled="!canProcessPayment"
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
import type { StaffSalary } from '@/types/payroll.types'
import { PayrollStatus } from '@/types/payroll.types'
import { fetchStaffSalaries, payStaffSalary } from '@/services/pages/payroll'

// Component name
defineOptions({
  name: 'PayrollPage',
})

// State
const selectedYear = ref(new Date().getFullYear())
const selectedMonthIndex = ref(new Date().getMonth())
const staffSalaries = ref<StaffSalary[]>([])
const loading = ref(false)
const processingPayment = ref(false)

// Payment Modal
const paymentModal = ref({
  show: false,
  staff: null as StaffSalary | null,
  amount: 0 as number,
  comment: '' as string,
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

const selectedMonth = computed(() => {
  return availableMonths.value[selectedMonthIndex.value]?.value || monthNames[currentMonth.value].value
})

const forMonth = computed(() => {
  return `${selectedYear.value}-${selectedMonth.value}`
})

const hasTeachers = computed(() => {
  return staffSalaries.value.some(staff => staff.user.role === 'teacher' && (staff.earningCommissionAmount || 0) > 0)
})

const remainingAmount = computed(() => {
  if (!paymentModal.value.staff) return 0
  return getTotalSalary(paymentModal.value.staff) - paymentModal.value.staff.paidAmount
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
  return (
    paymentModal.value.amount > 0 &&
    paymentModal.value.amount <= remainingAmount.value &&
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

const loadStaffSalaries = async () => {
  loading.value = true
  try {
    const response = await fetchStaffSalaries(forMonth.value)
    staffSalaries.value = Array.isArray(response) ? response : []
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'Ish haqi ma\'lumotlarini yuklashda xatolik', 'error')
    staffSalaries.value = []
  } finally {
    loading.value = false
  }
}

const handleYearChange = () => {
  if (selectedMonthIndex.value >= availableMonths.value.length) {
    selectedMonthIndex.value = 0
  }
  loadStaffSalaries()
}

const handleMonthChange = () => {
  loadStaffSalaries()
}

const openPaymentModal = (staff: StaffSalary) => {
  paymentModal.value = {
    show: true,
    staff,
    amount: getTotalSalary(staff) - staff.paidAmount,
    comment: '',
  }
}

const closePaymentModal = () => {
  if (processingPayment.value) return
  paymentModal.value = {
    show: false,
    staff: null,
    amount: 0,
    comment: '',
  }
}

const confirmPayment = async () => {
  if (!paymentModal.value.staff) return

  processingPayment.value = true
  try {
    if (!paymentModal.value.amount || paymentModal.value.amount <= 0) {
      showSnackbar('Iltimos, to\'g\'ri miqdorni kiriting', 'error')
      return
    }
    if (paymentModal.value.amount > remainingAmount.value) {
      showSnackbar('Miqdor qolgan summadan oshmasligi kerak', 'error')
      return
    }

    const payload: any = {
      amount: paymentModal.value.amount,
    }
    if (paymentModal.value.comment && paymentModal.value.comment.trim()) {
      payload.comment = paymentModal.value.comment.trim()
    }

    await payStaffSalary(paymentModal.value.staff.id, payload)
    showSnackbar(`${formatCurrency(paymentModal.value.amount)} miqdoridagi to'lov qabul qilindi`, 'success')
    paymentModal.value = {
      show: false,
      staff: null,
      amount: 0,
      comment: '',
    }
    await loadStaffSalaries()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || 'To\'lovni qayta ishlashda xatolik', 'error')
  } finally {
    processingPayment.value = false
  }
}

const getStatusColor = (status: PayrollStatus): string => {
  switch (status) {
    case PayrollStatus.PAID:
      return 'success'
    case PayrollStatus.PARTIAL:
      return 'warning'
    case PayrollStatus.UNPAID:
      return 'error'
    default:
      return 'grey'
  }
}

const getStatusLabel = (status: PayrollStatus): string => {
  switch (status) {
    case PayrollStatus.PAID:
      return 'To\'langan'
    case PayrollStatus.PARTIAL:
      return 'Qisman'
    case PayrollStatus.UNPAID:
      return 'To\'lanmagan'
    default:
      return status
  }
}

const getRoleLabel = (role: string): string => {
  switch (role) {
    case 'teacher':
      return 'O\'qituvchi'
    case 'manager':
      return 'Menejer'
    case 'admin':
      return 'Administrator'
    case 'super_admin':
      return 'Super Administrator'
    default:
      return role
  }
}

const getBaseSalary = (staff: StaffSalary): number => {
  // For teachers, use earningBaseSalarySnapshot if available, otherwise baseSalary
  // For non-teachers, use baseSalary
  return staff.earningBaseSalarySnapshot ?? staff.baseSalary
}

const getCommissionAmount = (staff: StaffSalary): number => {
  // Only for teachers
  if (staff.user.role !== 'teacher') {
    return 0
  }
  return staff.earningCommissionAmount ?? 0
}

const getTotalSalary = (staff: StaffSalary): number => {
  // For teachers, use earningTotalEarning if available
  // For non-teachers, use baseSalary
  if (staff.user.role === 'teacher' && staff.earningTotalEarning !== undefined) {
    return staff.earningTotalEarning
  }
  return staff.baseSalary
}

const getRemainingAmount = (staff: StaffSalary): number => {
  return getTotalSalary(staff) - staff.paidAmount
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
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
  loadStaffSalaries()
})
</script>

<style scoped>
.payroll-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.payroll-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

.payroll-table thead {
  background-color: rgba(0, 0, 0, 0.05);
}

.payroll-table th,
.payroll-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.payroll-table th {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.payroll-table td {
  font-size: 0.875rem;
}

.staff-name {
  font-weight: 500;
}

.text-end {
  text-align: right;
}

.row-unpaid {
  background-color: rgba(244, 67, 54, 0.05);
}

.row-partial {
  background-color: rgba(255, 152, 0, 0.05);
}

.row-paid {
  background-color: rgba(76, 175, 80, 0.05);
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
