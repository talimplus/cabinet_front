<template>
  <div>
    <div v-if="loading && !data" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else-if="data">
      <!-- ── Xodim haqida ──────────────────────────────── -->
      <v-card class="mb-4">
        <v-card-text>
          <div class="d-flex align-center flex-wrap" style="gap: 16px">
            <v-avatar color="primary" size="56" variant="tonal">
              <span class="text-h6">{{ initials }}</span>
            </v-avatar>

            <div class="flex-grow-1">
              <div class="text-h6">
                {{ data.user.firstName }} {{ data.user.lastName }}
              </div>
              <div class="text-body-2 text-medium-emphasis">
                {{ data.user.roleName || data.user.role }}
                <template v-if="data.user.centerName"> · {{ data.user.centerName }}</template>
                <template v-if="data.user.phone"> · {{ data.user.phone }}</template>
              </div>
            </div>

            <v-select
              v-model="selectedMonth"
              :items="monthOptions"
              item-title="title"
              item-value="value"
              :label="$t('staff.month')"
              variant="outlined"
              density="compact"
              hide-details
              style="max-width: 200px"
              @update:model-value="load"
            ></v-select>
          </div>
        </v-card-text>
      </v-card>

      <!-- ── Statistika ────────────────────────────────── -->
      <v-row dense class="mb-2">
        <v-col v-for="stat in stats" :key="stat.key" cols="6" md="3">
          <v-card variant="tonal" :color="stat.color">
            <v-card-text class="py-3">
              <div class="text-caption">{{ stat.label }}</div>
              <div class="text-h6">{{ stat.value }}</div>
              <div v-if="stat.hint" class="text-caption text-medium-emphasis">
                {{ stat.hint }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- ── Oylik ─────────────────────────────────────── -->
      <v-card v-if="data.salary" class="mb-4">
        <v-card-title class="text-subtitle-1">
          {{ $t('staff.salary.title', { month: formatMonth(data.salary.forMonth) }) }}
        </v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">{{ $t('staff.salary.base') }}</div>
              <div class="text-body-1">{{ money(data.salary.baseSalary) }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">{{ $t('staff.salary.deduction') }}</div>
              <div class="text-body-1" :class="{ 'text-error': data.salary.deductionAmount > 0 }">
                {{ data.salary.deductionAmount > 0 ? '−' : '' }}{{ money(data.salary.deductionAmount) }}
              </div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">{{ $t('staff.salary.net') }}</div>
              <div class="text-body-1 font-weight-bold">{{ money(data.salary.netSalary) }}</div>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-caption text-medium-emphasis">{{ $t('staff.salary.remaining') }}</div>
              <div class="text-body-1" :class="{ 'text-error': data.salary.remaining > 0 }">
                {{ money(data.salary.remaining) }}
              </div>
            </v-col>
          </v-row>

          <!-- Qaysi jarimadan qancha ushlangani -->
          <div v-if="data.salary.appliedDeductions.length" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-1">
              {{ $t('staff.salary.appliedTitle') }}
            </div>
            <div
              v-for="applied in data.salary.appliedDeductions"
              :key="applied.id"
              class="text-caption"
            >
              − {{ money(applied.amount) }} · {{ applied.reason }}
              <span v-if="applied.sourceForMonth !== data.salary.forMonth" class="text-warning">
                ({{ $t('staff.salary.fromMonth', { month: formatMonth(applied.sourceForMonth) }) }})
              </span>
            </div>
          </div>

          <v-alert
            v-if="data.summary.deductionOutstanding > 0"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-3"
            :text="$t('staff.salary.outstandingHint', { amount: money(data.summary.deductionOutstanding) })"
          ></v-alert>

          <div v-if="showActions" class="d-flex flex-wrap mt-4" style="gap: 8px">
            <v-btn
              v-if="canPay && data.salary.remaining > 0"
              color="primary"
              prepend-icon="mdi-cash-check"
              @click="openPay"
            >
              {{ $t('staff.salary.payButton') }}
            </v-btn>
            <v-btn
              v-if="canDeduct"
              color="error"
              variant="tonal"
              prepend-icon="mdi-cash-minus"
              @click="openDeduction"
            >
              {{ $t('staff.deduction.addButton') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Oylik qatori yo'q, lekin jarima yozish mumkin -->
      <div v-else-if="showActions && canDeduct" class="mb-4">
        <v-btn color="error" variant="tonal" prepend-icon="mdi-cash-minus" @click="openDeduction">
          {{ $t('staff.deduction.addButton') }}
        </v-btn>
      </div>

      <!-- ── Jadvallar ─────────────────────────────────── -->
      <v-card>
        <v-tabs v-model="tab" bg-color="primary" slider-color="white">
          <v-tab value="late">
            {{ $t('staff.tabs.late') }}
            <v-chip v-if="data.lateRecords.length" size="x-small" class="ms-2">
              {{ data.lateRecords.length }}
            </v-chip>
          </v-tab>
          <v-tab value="receipts">
            {{ $t('staff.tabs.receipts') }}
            <v-chip
              v-if="data.summary.unsettledCount"
              size="x-small"
              color="error"
              class="ms-2"
            >
              {{ data.summary.unsettledCount }}
            </v-chip>
          </v-tab>
          <v-tab value="deductions">
            {{ $t('staff.tabs.deductions') }}
            <v-chip v-if="data.deductions.length" size="x-small" class="ms-2">
              {{ data.deductions.length }}
            </v-chip>
          </v-tab>
          <v-tab value="months">{{ $t('staff.tabs.months') }}</v-tab>
        </v-tabs>

        <v-window v-model="tab">
          <!-- Kechikishlar -->
          <v-window-item value="late">
            <v-data-table
              :items="data.lateRecords"
              :headers="lateHeaders"
              hide-default-footer
              :items-per-page="-1"
              :no-data-text="$t('staff.empty.late')"
            >
              <template #[`item.workDate`]="{ item }">{{ formatDate(item.workDate) }}</template>
              <template #[`item.checkInAt`]="{ item }">{{ formatTime(item.checkInAt) }}</template>
              <template #[`item.firstLessonAt`]="{ item }">
                {{ item.firstLessonAt ? item.firstLessonAt.slice(0, 5) : '—' }}
              </template>
              <template #[`item.lateMinutes`]="{ item }">
                <span class="text-warning font-weight-medium">
                  +{{ item.lateMinutes }} {{ $t('staffAttendance.minutesShort') }}
                </span>
              </template>
              <template #[`item.confidence`]="{ item }">
                <v-chip size="x-small" variant="tonal" :color="confidenceColor(item.confidence)">
                  {{ $t(`staffAttendance.confidence.${item.confidence}`) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Topshirilmagan pullar -->
          <v-window-item value="receipts">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="ma-4"
              :text="$t('staff.receipts.hint')"
            ></v-alert>
            <v-data-table
              :items="data.unsettledReceipts"
              :headers="receiptHeaders"
              hide-default-footer
              :items-per-page="-1"
              :no-data-text="$t('staff.empty.receipts')"
            >
              <template #[`item.receivedAt`]="{ item }">
                {{ formatDateTime(item.receivedAt) }}
              </template>
              <template #[`item.student`]="{ item }">
                {{ item.student ? `${item.student.firstName} ${item.student.lastName}` : '—' }}
                <div v-if="item.group" class="text-caption text-medium-emphasis">
                  {{ item.group.name }}
                </div>
              </template>
              <template #[`item.amount`]="{ item }">
                <span class="font-weight-medium">{{ money(item.amount) }}</span>
              </template>
              <template #[`item.status`]="{ item }">
                <v-chip
                  size="small"
                  variant="tonal"
                  :color="item.status === 'rejected' ? 'error' : 'warning'"
                >
                  {{ $t(`staff.receiptStatus.${item.status}`) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Jarimalar -->
          <v-window-item value="deductions">
            <v-data-table
              :items="data.deductions"
              :headers="deductionHeaders"
              hide-default-footer
              :items-per-page="-1"
              :no-data-text="$t('staff.empty.deductions')"
            >
              <template #[`item.sourceForMonth`]="{ item }">
                {{ formatMonth(item.sourceForMonth) }}
              </template>
              <template #[`item.amount`]="{ item }">
                <span class="text-error font-weight-medium">{{ money(item.amount) }}</span>
              </template>
              <template #[`item.remainingAmount`]="{ item }">
                <span v-if="item.remainingAmount > 0" class="text-warning">
                  {{ money(item.remainingAmount) }}
                </span>
                <v-chip v-else size="x-small" color="success" variant="tonal">
                  {{ $t('staff.deduction.settled') }}
                </v-chip>
              </template>
              <template #[`item.type`]="{ item }">
                {{ $t(`staff.deductionType.${item.type}`) }}
              </template>
              <template #[`item.actions`]="{ item }">
                <v-btn
                  v-if="canDeduct"
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="medium-emphasis"
                  @click="removeDeduction(item)"
                ></v-btn>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Oyma-oy davomat -->
          <v-window-item value="months">
            <v-data-table
              :items="data.months"
              :headers="monthHeaders"
              hide-default-footer
              :items-per-page="-1"
              :no-data-text="$t('staff.empty.months')"
            >
              <template #[`item.month`]="{ item }">{{ formatMonth(item.month) }}</template>
              <template #[`item.missedDays`]="{ item }">
                <span v-if="item.missedDays > 0" class="text-error">{{ item.missedDays }}</span>
                <span v-else class="text-medium-emphasis">0</span>
              </template>
              <template #[`item.totalLateMinutes`]="{ item }">
                <span v-if="item.totalLateMinutes > 0" class="text-warning">
                  {{ duration(item.totalLateMinutes) }}
                </span>
                <span v-else class="text-medium-emphasis">—</span>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card>
    </template>

    <!-- ── Oylik to'lash ──────────────────────────────── -->
    <v-dialog v-model="payDialog" width="460">
      <v-card :title="$t('staff.salary.payTitle')">
        <v-card-text>
          <div class="d-flex justify-space-between text-body-2 mb-1">
            <span>{{ $t('staff.salary.net') }}</span>
            <span>{{ money(data?.salary?.netSalary ?? 0) }}</span>
          </div>
          <div class="d-flex justify-space-between text-body-2 mb-3">
            <span>{{ $t('staff.salary.remaining') }}</span>
            <span class="font-weight-bold">{{ money(data?.salary?.remaining ?? 0) }}</span>
          </div>

          <v-text-field
            v-model.number="payForm.amount"
            type="number"
            :label="$t('staff.salary.payAmount')"
            :error-messages="payAmountError"
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-text-field>
          <v-textarea
            v-model="payForm.comment"
            :label="$t('common.comment')"
            variant="outlined"
            density="compact"
            rows="2"
          ></v-textarea>
        </v-card-text>
        <template #actions>
          <v-btn :text="$t('common.cancel')" @click="payDialog = false"></v-btn>
          <v-btn
            color="primary"
            :loading="submitting"
            :disabled="!!payAmountError.length"
            :text="$t('common.save')"
            @click="submitPay"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>

    <!-- ── Jarima yozish ──────────────────────────────── -->
    <v-dialog v-model="deductionDialog" width="460">
      <v-card :title="$t('staff.deduction.title')">
        <v-card-text>
          <v-text-field
            v-model.number="deductionForm.amount"
            type="number"
            :label="$t('staff.deduction.amount')"
            :hint="$t('staff.deduction.amountHint')"
            persistent-hint
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-text-field>
          <v-select
            v-model="deductionForm.type"
            :items="deductionTypeOptions"
            item-title="title"
            item-value="value"
            :label="$t('staff.deduction.type')"
            variant="outlined"
            density="compact"
            class="mb-3"
          ></v-select>
          <v-textarea
            v-model="deductionForm.reason"
            :label="$t('staff.deduction.reason')"
            :hint="$t('staff.deduction.reasonHint')"
            persistent-hint
            variant="outlined"
            density="compact"
            rows="2"
          ></v-textarea>
        </v-card-text>
        <template #actions>
          <v-btn :text="$t('common.cancel')" @click="deductionDialog = false"></v-btn>
          <v-btn
            color="error"
            :loading="submitting"
            :disabled="!deductionForm.amount || !deductionForm.reason?.trim()"
            :text="$t('common.save')"
            @click="submitDeduction"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'
import {
  createStaffDeduction,
  deleteStaffDeduction,
  fetchMyOverview,
  fetchStaffOverview,
} from '@/services/pages/staff'
import { payStaffSalary } from '@/services/pages/payroll'
import type {
  StaffDeduction,
  StaffDeductionType,
  StaffOverview,
} from '@/types/staff.types'

defineOptions({ name: 'StaffOverview' })

interface Props {
  /** `null` — o'z sahifasi (`/staff/me/overview`) */
  userId?: number | null
  /** Oylik to'lash / jarima yozish tugmalari ko'rinsinmi */
  showActions?: boolean
  /** Boshlang'ich oy (YYYY-MM) */
  month?: string
}

const props = withDefaults(defineProps<Props>(), {
  userId: null,
  showActions: false,
  month: '',
})

const emits = defineEmits<{ (e: 'changed'): void }>()

const { t } = useI18n()
const notify = useNotificationStore()
const { can } = usePermissions()

const canPay = computed(() => can('payroll.pay'))
const canDeduct = computed(() => can('payroll.deduct'))

const data = ref<StaffOverview | null>(null)
const loading = ref(false)
const submitting = ref(false)
const tab = ref<'late' | 'receipts' | 'deductions' | 'months'>('late')

const currentYm = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
const selectedMonth = ref(props.month || currentYm())

const payDialog = ref(false)
const payForm = ref<{ amount: number | null; comment: string }>({
  amount: null,
  comment: '',
})

const deductionDialog = ref(false)
const deductionForm = ref<{
  amount: number | null
  reason: string
  type: StaffDeductionType
}>({ amount: null, reason: '', type: 'other' })

// ── Formatlash ────────────────────────────────────────

const money = (amount: number): string =>
  `${new Intl.NumberFormat('uz-UZ').format(Math.round(Number(amount ?? 0)))} ${t('common.sum')}`

const formatDate = (value: string): string => {
  if (!value) return '—'
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

const formatMonth = (value: string | null): string => {
  if (!value) return '—'
  const [year, month] = value.split('-')
  return `${month}.${year}`
}

const formatTime = (iso: string): string =>
  iso
    ? new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
    : '—'

const formatDateTime = (iso: string): string =>
  iso
    ? new Date(iso).toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

const duration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} ${t('staffAttendance.minutesShort')}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest
    ? `${hours} ${t('staffAttendance.hoursShort')} ${rest} ${t('staffAttendance.minutesShort')}`
    : `${hours} ${t('staffAttendance.hoursShort')}`
}

const confidenceColor = (confidence: string): string =>
  confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error'

// ── Ko'rsatiladigan ma'lumot ──────────────────────────

const initials = computed(() => {
  const user = data.value?.user
  if (!user) return ''
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
})

/** Oxirgi 12 oy */
const monthOptions = computed(() => {
  const options = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    options.push({ value, title: `${value.slice(5)}.${value.slice(0, 4)}` })
  }
  return options
})

const stats = computed(() => {
  const summary = data.value?.summary
  if (!summary) return []
  return [
    {
      key: 'late',
      label: t('staff.stats.lateDays'),
      value: String(summary.lateDays),
      hint: summary.totalLateMinutes ? duration(summary.totalLateMinutes) : '',
      color: summary.lateDays > 0 ? 'warning' : undefined,
    },
    {
      key: 'missed',
      label: t('staff.stats.missedDays'),
      value: String(summary.missedDays),
      hint: t('staff.stats.missedHint', { days: summary.expectedDays }),
      color: summary.missedDays > 0 ? 'error' : undefined,
    },
    {
      key: 'unsettled',
      label: t('staff.stats.unsettled'),
      value: money(summary.unsettledAmount),
      hint: t('staff.stats.unsettledHint', { count: summary.unsettledCount }),
      color: summary.unsettledAmount > 0 ? 'error' : undefined,
    },
    {
      key: 'deduction',
      label: t('staff.stats.deduction'),
      value: money(summary.deductionThisMonth),
      hint: summary.deductionOutstanding
        ? t('staff.stats.deductionHint', { amount: money(summary.deductionOutstanding) })
        : '',
      color: summary.deductionThisMonth > 0 ? 'error' : undefined,
    },
  ]
})

const lateHeaders = computed(() => [
  { title: t('staff.table.date'), key: 'workDate', sortable: false },
  { title: t('staff.table.arrived'), key: 'checkInAt', sortable: false },
  { title: t('staff.table.lessonAt'), key: 'firstLessonAt', sortable: false },
  { title: t('staff.table.late'), key: 'lateMinutes', sortable: false },
  { title: t('staffAttendance.table.confidence'), key: 'confidence', sortable: false },
])

const receiptHeaders = computed(() => [
  { title: t('staff.table.receivedAt'), key: 'receivedAt', sortable: false },
  { title: t('staff.table.student'), key: 'student', sortable: false },
  { title: t('staff.table.amount'), key: 'amount', sortable: false },
  { title: t('staff.table.checkNo'), key: 'checkNo', sortable: false },
  { title: t('common.status'), key: 'status', sortable: false },
])

const deductionHeaders = computed(() => [
  { title: t('staff.table.month'), key: 'sourceForMonth', sortable: false },
  { title: t('staff.table.amount'), key: 'amount', sortable: false },
  { title: t('staff.table.remainingDeduction'), key: 'remainingAmount', sortable: false },
  { title: t('staff.table.reasonType'), key: 'type', sortable: false },
  { title: t('staff.table.reason'), key: 'reason', sortable: false },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

const monthHeaders = computed(() => [
  { title: t('staff.table.month'), key: 'month', sortable: false },
  { title: t('staffAttendance.report.expectedDays'), key: 'expectedDays', sortable: false },
  { title: t('staffAttendance.report.attendedDays'), key: 'attendedDays', sortable: false },
  { title: t('staffAttendance.report.missedDays'), key: 'missedDays', sortable: false },
  { title: t('staffAttendance.report.lateDays'), key: 'lateDays', sortable: false },
  { title: t('staffAttendance.report.totalLate'), key: 'totalLateMinutes', sortable: false },
])

const deductionTypeOptions = computed(() => [
  { value: 'late', title: t('staff.deductionType.late') },
  { value: 'unsettled_payment', title: t('staff.deductionType.unsettled_payment') },
  { value: 'other', title: t('staff.deductionType.other') },
])

const payAmountError = computed(() => {
  const amount = Number(payForm.value.amount ?? 0)
  if (!amount) return []
  if (amount <= 0) return [t('staff.salary.payPositive')]
  const remaining = data.value?.salary?.remaining ?? 0
  if (amount > remaining) {
    return [t('staff.salary.payTooMuch', { amount: money(remaining) })]
  }
  return []
})

// ── Amallar ───────────────────────────────────────────

const load = async () => {
  try {
    loading.value = true
    data.value = props.userId
      ? await fetchStaffOverview(props.userId, selectedMonth.value)
      : await fetchMyOverview(selectedMonth.value)
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  } finally {
    loading.value = false
  }
}

const openPay = () => {
  payForm.value = { amount: data.value?.salary?.remaining ?? null, comment: '' }
  payDialog.value = true
}

const submitPay = async () => {
  const salaryId = data.value?.salary?.id
  if (!salaryId) return
  try {
    submitting.value = true
    await payStaffSalary(salaryId, {
      amount: Number(payForm.value.amount ?? 0),
      comment: payForm.value.comment?.trim() || undefined,
    })
    payDialog.value = false
    notify.success(t('staff.salary.paySuccess'))
    await load()
    emits('changed')
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  } finally {
    submitting.value = false
  }
}

const openDeduction = () => {
  deductionForm.value = { amount: null, reason: '', type: 'other' }
  deductionDialog.value = true
}

const submitDeduction = async () => {
  const userId = props.userId ?? data.value?.user.id
  if (!userId) return
  try {
    submitting.value = true
    await createStaffDeduction({
      userId,
      amount: Number(deductionForm.value.amount ?? 0),
      reason: deductionForm.value.reason.trim(),
      type: deductionForm.value.type,
      forMonth: selectedMonth.value,
    })
    deductionDialog.value = false
    notify.success(t('staff.deduction.success'))
    await load()
    emits('changed')
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  } finally {
    submitting.value = false
  }
}

const removeDeduction = async (deduction: StaffDeduction) => {
  if (!window.confirm(t('staff.deduction.confirmDelete'))) return
  try {
    await deleteStaffDeduction(deduction.id)
    notify.success(t('staff.deduction.deleted'))
    await load()
    emits('changed')
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('common.errors.unknown'))
  }
}

watch(() => props.userId, load)

onMounted(load)

defineExpose({ load })
</script>
