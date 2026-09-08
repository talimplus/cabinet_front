<template>
  <v-container fluid>
    <!-- Header -->
    <div class="d-flex align-center mb-4" style="gap: 8px">
      <v-btn variant="text" icon="mdi-arrow-left" @click="goBack"></v-btn>
      <h2 class="text-h5">{{ $t('students.view.title') }}</h2>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Not found -->
    <v-alert v-else-if="!summary" type="warning" variant="tonal">
      {{ $t('students.view.notFound') }}
    </v-alert>

    <template v-else>
      <!-- Student card -->
      <v-card class="mb-4">
        <v-card-text class="d-flex flex-wrap align-center" style="gap: 24px">
          <v-avatar color="primary" size="56">
            <span class="text-h6">{{ initials }}</span>
          </v-avatar>
          <div>
            <div class="text-h6">
              {{ summary.student.firstName }} {{ summary.student.lastName }}
            </div>
            <div class="text-body-2 text-medium-emphasis">
              {{ $t('students.view.card.phone') }}: {{ summary.student.phone || '—' }}
            </div>
          </div>
          <v-chip :color="studentStatusColor" size="small" variant="flat">
            {{ studentStatusLabel }}
          </v-chip>
          <div class="ms-auto d-flex align-center" style="gap: 24px">
            <div class="text-right">
              <div class="text-caption text-medium-emphasis">
                {{ $t('students.view.card.monthlyFee') }}
              </div>
              <div class="text-h6">{{ formatCurrency(summary.student.monthlyFee) }}</div>
            </div>
            <v-btn
              v-if="canEditActiveStudent"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-pencil"
              :loading="loadingEdit"
              @click="openEditModal"
            >
              {{ $t('common.edit') }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <!-- Ma'lumotlar (GET /students/{id}) -->
      <v-card v-if="detail" class="mb-4">
        <v-card-title class="text-h6 pa-4">{{ $t('students.view.info.title') }}</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.subject') }}</div>
              <div class="info-value">{{ detail.subject?.name || '—' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.center') }}</div>
              <div class="info-value">{{ detail.centerName || '—' }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.birthDate') }}</div>
              <div class="info-value">{{ formatDate(detail.birthDate) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.preferredTime') }}</div>
              <div class="info-value">{{ timeLabel(detail.preferredTime) }}</div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.discount') }}</div>
              <div class="info-value">
                {{ Number(detail.discountPercent) > 0 ? detail.discountPercent + '%' : '—' }}
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="info-label">{{ $t('students.view.info.preferredDays') }}</div>
              <div class="info-value">
                <template v-if="detail.preferredDays?.length">
                  <v-chip
                    v-for="day in detail.preferredDays"
                    :key="day"
                    size="x-small"
                    class="me-1 mb-1"
                  >
                    {{ dayLabel(day) }}
                  </v-chip>
                </template>
                <span v-else>—</span>
              </div>
            </v-col>
            <v-col cols="12">
              <div class="info-label">{{ $t('students.view.info.groups') }}</div>
              <div v-if="detail.groups?.length" class="mt-1">
                <div
                  v-for="group in detail.groups"
                  :key="group.id"
                  class="d-flex flex-wrap align-center py-1"
                  style="gap: 8px"
                >
                  <v-chip color="primary" size="small" variant="tonal">{{ group.name }}</v-chip>
                  <span v-if="group.monthlyFee != null" class="text-body-2 font-weight-medium">
                    {{ formatCurrency(group.monthlyFee) }}
                  </span>
                  <span v-if="groupScheduleText(group)" class="text-body-2 text-medium-emphasis">
                    · {{ groupScheduleText(group) }}
                  </span>
                </div>
              </div>
              <div v-else class="info-value text-medium-emphasis">
                {{ $t('students.view.info.noGroups') }}
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Stats cards -->
      <v-row class="mb-2">
        <!-- 1. Jami hisoblangan -->
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal" color="info" height="100%">
            <v-card-text>
              <div class="text-caption">{{ $t('students.view.stats.totalDue') }}</div>
              <div class="text-h6">{{ formatCurrency(summary.totals.totalDue) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <!-- 2. Jami to'langan -->
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal" color="success" height="100%">
            <v-card-text>
              <div class="text-caption">{{ $t('students.view.stats.totalPaid') }}</div>
              <div class="text-h6">{{ formatCurrency(summary.totals.totalPaid) }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <!-- 3. Jami qarz — bo'rttirib ko'rsatiladi -->
        <v-col cols="12" sm="6" md="4">
          <v-card
            :variant="summary.totals.totalDebt > 0 ? 'flat' : 'tonal'"
            :color="summary.totals.totalDebt > 0 ? 'error' : 'grey'"
            height="100%"
            class="debt-card"
          >
            <v-card-text>
              <div class="text-caption">{{ $t('students.view.stats.totalDebt') }}</div>
              <div class="text-h5 font-weight-bold">
                {{ formatCurrency(summary.totals.totalDebt) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <!-- 4. Tasdiqlash kutmoqda — neytral/kulrang, faqat > 0 bo'lsa -->
        <v-col v-if="hasPending" cols="12" sm="6" md="4">
          <v-card variant="tonal" color="warning" height="100%">
            <v-card-text>
              <div class="text-caption">{{ $t('students.view.stats.totalPending') }}</div>
              <div class="text-h6">{{ formatCurrency(summary.totals.totalPending) }}</div>
              <div class="text-caption text-medium-emphasis mt-1">
                {{ $t('students.view.stats.totalPendingHint') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <!-- 5. O'quvchidan olinishi kerak (payableNow) — asosiy CTA, eng ajralib turadi -->
        <v-col cols="12" sm="6" md="4">
          <v-card color="primary" variant="flat" elevation="6" height="100%" class="payable-card">
            <v-card-text>
              <div class="d-flex align-center" style="gap: 6px">
                <v-icon icon="mdi-hand-coin" size="20"></v-icon>
                <span class="text-caption">{{ $t('students.view.stats.payableNow') }}</span>
              </div>
              <div class="text-h4 font-weight-bold mt-1">
                {{ formatCurrency(summary.totals.payableNow) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pay debt action -->
      <div class="d-flex justify-end align-center mb-4" style="gap: 12px">
        <span v-if="payableNow <= 0" class="text-body-2 text-medium-emphasis">
          {{ $t('students.view.allSettled') }}
        </span>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-cash-multiple"
          :disabled="payableNow <= 0"
          @click="openPayModal"
        >
          {{ $t('students.view.payDebt') }}
        </v-btn>
      </div>

      <!-- Months table -->
      <v-card>
        <v-card-title class="text-h6 pa-4">{{ $t('students.view.table.title') }}</v-card-title>
        <v-card-text>
          <v-data-table
            :items="summary.months"
            :headers="headers"
            hide-default-footer
            :items-per-page="-1"
          >
            <template v-slot:item.forMonth="{ item }">
              {{ formatMonth(item.forMonth) }}
            </template>
            <template v-slot:item.lessons="{ item }">
              <template v-if="item.lessonsPlanned != null">
                {{ item.lessonsBillable ?? 0 }} / {{ item.lessonsPlanned }}
              </template>
              <span v-else class="text-medium-emphasis">—</span>
            </template>
            <template v-slot:item.amountDue="{ item }">
              <div class="d-flex flex-column">
                <div class="d-flex align-center flex-wrap" style="gap: 6px">
                  <!-- Proratsiya: to'liq oylik chizib tashlanadi, yonida haqiqiy summa -->
                  <span
                    v-if="item.isProrated === true && item.fullAmount"
                    class="text-decoration-line-through text-medium-emphasis"
                  >
                    {{ formatCurrency(item.fullAmount) }}
                  </span>
                  <span class="font-weight-medium">{{ formatCurrency(item.amountDue) }}</span>
                  <span
                    v-if="item.isProrated === true && item.lessonsPlanned != null"
                    class="text-caption text-medium-emphasis"
                  >
                    · {{ $t('students.view.table.lessonsShort', {
                      billable: item.lessonsBillable ?? 0,
                      planned: item.lessonsPlanned,
                    }) }}
                  </span>
                </div>
                <!-- Sababli (excused) darslar belgisi -->
                <span
                  v-if="item.lessonsExcused && item.lessonsExcused > 0"
                  class="excused-badge text-caption text-info mt-1"
                >
                  {{ $t('students.view.table.excused', { count: item.lessonsExcused }) }}
                </span>
                <!-- Qo'lda chiqarib tashlangan summa -->
                <span
                  v-if="item.manualExcludedAmount && item.manualExcludedAmount > 0"
                  class="text-caption text-warning mt-1"
                >
                  {{ $t('students.view.table.excluded', { amount: formatCurrency(item.manualExcludedAmount) }) }}
                  <span v-if="item.manualExcludedReason">({{ item.manualExcludedReason }})</span>
                </span>
              </div>
            </template>
            <template v-slot:item.amountPaid="{ item }">
              {{ formatCurrency(item.amountPaid) }}
            </template>
            <template v-slot:item.remaining="{ item }">
              <span :class="{ 'text-error font-weight-medium': item.remaining > 0 }">
                {{ formatCurrency(item.remaining) }}
              </span>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip :color="statusColor(item.status)" size="small" variant="flat">
                {{ $t(`students.view.status.${item.status}`) }}
              </v-chip>
            </template>
            <template v-slot:no-data>
              <div class="text-center text-medium-emphasis pa-4">
                {{ $t('students.view.table.empty') }}
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>

    <!-- Pay debt modal -->
    <v-dialog v-model="payDialog" max-width="560">
      <v-card>
        <v-card-title class="text-h6 pa-4">{{ $t('students.view.modal.title') }}</v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model.number="form.amount"
            :label="$t('students.view.modal.amount')"
            type="number"
            variant="outlined"
            density="compact"
            :suffix="$t('students.view.currency')"
            :error-messages="amountError ? [amountError] : []"
            hide-details="auto"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="form.paymentMethod"
            :items="methodOptions"
            item-title="title"
            item-value="value"
            :label="$t('students.view.modal.paymentMethod')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-select>

          <!-- Karta bo'lsa — to'lov qilingan sana -->
          <v-text-field
            v-if="form.paymentMethod === 'card'"
            v-model="form.paidAt"
            :label="$t('students.view.modal.paidAt')"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="form.comment"
            :label="$t('students.view.modal.comment')"
            rows="2"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-textarea>

          <!-- Allocation preview -->
          <v-card variant="outlined">
            <v-card-text class="py-3">
              <div class="text-subtitle-2 mb-1">{{ $t('students.view.modal.previewTitle') }}</div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ $t('students.view.modal.previewHint') }}
              </div>
              <div v-if="allocationPreview.length === 0" class="text-caption text-medium-emphasis">
                {{ $t('students.view.modal.previewEmpty') }}
              </div>
              <div
                v-for="row in allocationPreview"
                :key="row.forMonth"
                class="d-flex justify-space-between align-center py-1 preview-row"
              >
                <span class="text-body-2">
                  {{ formatMonth(row.forMonth) }}
                  <span class="text-medium-emphasis">· {{ row.groupName }}</span>
                </span>
                <span class="text-body-2 font-weight-medium">
                  {{ formatCurrency(row.allocated) }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="payDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="paying"
            :disabled="!canPay"
            @click="submitPayment"
          >
            {{ $t('students.view.modal.pay') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- O'quvchini tahrirlash modali -->
    <CreateStudent
      v-model:open="editModal"
      :formForEdit="editForm"
      @updateData="onStudentUpdated"
      @clearForm="clearEditForm"
    ></CreateStudent>

    <!-- Chek modali -->
    <CheckModal v-model="checkModal.show" :checks="checkModal.checks" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import type { PaymentCheck, PaymentMethod, StudentPaymentSummary } from '@/types/payments.types'
import type { Student, StudentDetail } from '@/types/students.types'
import { fetchStudentPaymentSummary, payStudentDebt } from '@/services/pages/payments'
import { fetchStudentById } from '@/services/pages/students'
import { useNotificationStore } from '@/stores/notification'
import { usePermissions } from '@/composables/usePermissions'
import CreateStudent from '@/components/students/CreateStudent.vue'
import CheckModal from '@/components/pages/payments/CheckModal.vue'

defineOptions({ name: 'StudentView' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const notify = useNotificationStore()
const { canEditActiveStudent } = usePermissions()

const studentId = computed(() => {
  const id = route.params.id
  return !id || Array.isArray(id) ? null : Number(id)
})

const summary = ref<StudentPaymentSummary | null>(null)
const detail = ref<StudentDetail | null>(null)
const loading = ref(false)

const hasPending = computed(() => (summary.value?.totals.totalPending ?? 0) > 0)

const initials = computed(() => {
  const s = summary.value?.student
  if (!s) return ''
  return `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase()
})

// Pay debt modal
const payDialog = ref(false)
const paying = ref(false)
const form = ref<{
  amount: number | null
  paymentMethod: PaymentMethod
  paidAt: string | null
  comment: string
}>({
  amount: null,
  paymentMethod: 'cash',
  paidAt: null,
  comment: '',
})

// Chek modali — qarz to'langach har oyga bitta chek
const checkModal = ref({
  show: false,
  checks: [] as PaymentCheck[],
})

const methodOptions = computed(() => [
  { title: t('students.view.method.cash'), value: 'cash' },
  { title: t('students.view.method.card'), value: 'card' },
  { title: t('students.view.method.bank_transfer'), value: 'bank_transfer' },
  { title: t('students.view.method.online'), value: 'online' },
])

const headers = computed(() => [
  { title: t('students.view.table.month'), key: 'forMonth' },
  { title: t('students.view.table.group'), key: 'groupName' },
  { title: t('students.view.table.lessons'), key: 'lessons', sortable: false },
  { title: t('students.view.table.amountDue'), key: 'amountDue' },
  { title: t('students.view.table.amountPaid'), key: 'amountPaid' },
  { title: t('students.view.table.remaining'), key: 'remaining' },
  { title: t('students.view.table.status'), key: 'status' },
])

const payableNow = computed(() => summary.value?.totals.payableNow ?? 0)

// Summa validatsiyasi: 0 < amount <= payableNow
const amountError = computed<string>(() => {
  const amt = form.value.amount
  if (amt === null || amt === undefined || Number.isNaN(amt) || amt <= 0) {
    return t('students.view.validation.min')
  }
  if (amt > payableNow.value) {
    return t('students.view.validation.max', { amount: formatCurrency(payableNow.value) })
  }
  return ''
})

const canPay = computed(() => !amountError.value && !paying.value && payableNow.value > 0)

// Kiritilgan summani oylar bo'yicha (eng eskisidan yangisiga) oldindan taqsimlash —
// backend logikasini takrorlaydi: months eng yangidan eskisiga tartiblangan, shuning
// uchun teskarilab (oldest -> newest) to'ldiramiz.
const allocationPreview = computed(() => {
  const amt = Number(form.value.amount) || 0
  if (amt <= 0 || !summary.value) return []
  let left = amt
  const rows: { forMonth: string; groupName: string; allocated: number }[] = []
  const monthsAsc = [...summary.value.months].reverse()
  for (const m of monthsAsc) {
    if (left <= 0) break
    if (m.remaining <= 0) continue
    const allocated = Math.min(left, m.remaining)
    rows.push({ forMonth: m.forMonth, groupName: m.groupName, allocated })
    left -= allocated
  }
  return rows
})

const openPayModal = () => {
  form.value = {
    amount: payableNow.value,
    paymentMethod: 'cash',
    paidAt: null,
    comment: '',
  }
  payDialog.value = true
}

const loadSummary = async () => {
  if (!studentId.value) return
  loading.value = true
  try {
    summary.value = await fetchStudentPaymentSummary(studentId.value)
  } catch (error) {
    // Xato xabari axios interceptor'da global toast sifatida ko'rsatiladi
    console.error('Failed to load student summary:', error)
  } finally {
    loading.value = false
  }
}

const loadDetail = async () => {
  if (!studentId.value) return
  try {
    const { data } = await fetchStudentById(studentId.value)
    detail.value = data
  } catch (error) {
    console.error('Failed to load student detail:', error)
  }
}

const submitPayment = async () => {
  if (!studentId.value || !canPay.value) return
  paying.value = true
  try {
    // So'rov body orqali JSON yuboriladi (Content-Type: application/json)
    const updated = await payStudentDebt(studentId.value, {
      amount: form.value.amount ?? undefined,
      paymentMethod: form.value.paymentMethod,
      paidAt:
        form.value.paymentMethod === 'card' && form.value.paidAt ? form.value.paidAt : undefined,
      comment: form.value.comment?.trim() || undefined,
    })
    // pay-debt javobida har oyga bitta chek keladi (checks[])
    const checks = updated?.checks ?? []
    // Backend javobida yangi summary bo'lsa — undan foydalanamiz, aks holda qayta yuklaymiz
    if (updated && updated.totals && updated.student) {
      summary.value = updated
    } else {
      await loadSummary()
    }
    payDialog.value = false
    notify.success(t('students.view.messages.paySuccess'))
    if (checks.length > 0) {
      checkModal.value = { show: true, checks }
    }
  } catch (error) {
    // 400 va boshqa xatolardagi backend message interceptor'da ko'rsatiladi
    console.error('Failed to pay debt:', error)
  } finally {
    paying.value = false
  }
}

// O'quvchini tahrirlash: to'liq ma'lumotni olib, mavjud CreateStudent modalini ochamiz
const editModal = ref(false)
const editForm = ref<Student>({} as Student)
const loadingEdit = ref(false)

const clearEditForm = () => {
  editForm.value = {} as Student
}

// StudentDetail'ni CreateStudent modali kutadigan shaklga o'giramiz:
// yangi javobda `groups` — obyektlar ro'yxati, modalga esa `groupIds` kerak.
const toEditForm = (d: StudentDetail): Student => ({
  ...(d as unknown as Student),
  groupIds: (d.groups ?? []).map((g) => g.id),
})

const openEditModal = async () => {
  if (!studentId.value) return
  loadingEdit.value = true
  try {
    // Sahifada allaqachon yuklangan detail bo'lsa, qayta so'ramaymiz
    if (!detail.value) await loadDetail()
    if (!detail.value) return
    editForm.value = toEditForm(detail.value)
    editModal.value = true
  } catch (error) {
    console.error('Failed to load student for edit:', error)
  } finally {
    loadingEdit.value = false
  }
}

// Tahrirlash muvaffaqiyatli bo'lgach summary + detail qayta yuklanadi
const onStudentUpdated = async () => {
  await Promise.all([loadSummary(), loadDetail()])
}

const goBack = () => {
  if (window.history.length > 1) router.back()
  else router.push('/students')
}

const formatCurrency = (amount: number | undefined | null): string => {
  const value = Number(amount) || 0
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) +
    ' ' +
    t('students.view.currency')
  )
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// Kun nomini tarjima qilish (backend 'tuesday' kabi yuboradi)
const dayLabel = (day: string): string => {
  const key = `students.days.${day?.toLowerCase()}`
  const label = t(key)
  return label === key ? day : label
}

const timeLabel = (time: string | null | undefined): string => {
  if (time === 'morning') return t('students.time.morning')
  if (time === 'evening') return t('students.time.evening')
  return time || '—'
}

// Guruh jadvalini ixcham matnga aylantirish: "Se 13:00, Pa 13:00"
const groupScheduleText = (group: { schedule?: { day: string; startTime: string }[] }): string => {
  if (!group.schedule?.length) return ''
  return group.schedule
    .map((s) => `${dayLabel(s.day)} ${s.startTime?.slice(0, 5)}`)
    .join(', ')
}

const formatMonth = (ym: string): string => {
  if (!ym) return '—'
  const [y, m] = ym.split('-').map(Number)
  if (!y || !m) return ym
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long' })
}

const statusColor = (status: 'paid' | 'unpaid' | 'partial'): string => {
  switch (status) {
    case 'paid':
      return 'success'
    case 'partial':
      return 'warning'
    case 'unpaid':
      return 'error'
    default:
      return 'grey'
  }
}

const studentStatusColor = computed(() => {
  switch (summary.value?.student.status) {
    case 'active':
      return 'success'
    case 'new':
      return 'info'
    case 'ignored':
      return 'warning'
    case 'stopped':
      return 'error'
    case 'finished':
      return 'grey'
    default:
      return 'grey'
  }
})

const studentStatusLabel = computed(() => summary.value?.student.status ?? '—')

onMounted(() => {
  loadSummary()
  loadDetail()
})
</script>

<style scoped>
.debt-card {
  border: 1px solid transparent;
}
.info-label {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 2px;
}
.info-value {
  font-size: 1rem;
  color: rgba(0, 0, 0, 0.87);
}
.preview-row + .preview-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
/* Sababli darslar belgisi — chap tomonda "▎" ustun chizig'i */
.excused-badge {
  display: inline-block;
  padding-left: 8px;
  border-left: 3px solid rgb(var(--v-theme-info));
  line-height: 1.2;
}
</style>
