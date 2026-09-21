<template>
  <v-container fluid>
    <!-- Filtrlar — ham statistikaga, ham jadvalga tegishli -->
    <v-card class="mb-4">
      <v-card-text class="pa-4">
        <v-row dense align="center">
          <v-col cols="12" sm="6" md="3">
            <v-date-input
              v-model="filters.dateFrom"
              :label="$t('pendingReceipts.filters.dateFrom')"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-date-input>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-date-input
              v-model="filters.dateTo"
              :label="$t('pendingReceipts.filters.dateTo')"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @update:model-value="handleFilterChange"
            ></v-date-input>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-btn
              variant="text"
              prepend-icon="mdi-filter-remove-outline"
              :disabled="!hasFilters"
              @click="resetFilters"
            >
              {{ $t('pendingReceipts.filters.reset') }}
            </v-btn>
          </v-col>
        </v-row>
        <p class="text-caption text-medium-emphasis mt-2 mb-0">
          {{ $t('pendingReceipts.filters.hint') }}
        </p>
      </v-card-text>
    </v-card>

    <!-- Statistika -->
    <v-row class="mb-4" dense>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="success" variant="tonal" rounded size="44">
                <v-icon size="24">mdi-check-decagram</v-icon>
              </v-avatar>
              <div class="stat-body">
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.confirmed') }}
                </div>
                <div class="stat-amount text-success">
                  {{ statsLoading ? '—' : formatCurrency(stats.confirmed.amount) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.count', { count: stats.confirmed.count }) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="warning" variant="tonal" rounded size="44">
                <v-icon size="24">mdi-clock-alert-outline</v-icon>
              </v-avatar>
              <div class="stat-body">
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.pending') }}
                </div>
                <div class="stat-amount text-warning">
                  {{ statsLoading ? '—' : formatCurrency(stats.pending.amount) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.count', { count: stats.pending.count }) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="error" variant="tonal" rounded size="44">
                <v-icon size="24">mdi-close-circle-outline</v-icon>
              </v-avatar>
              <div class="stat-body">
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.rejected') }}
                </div>
                <div class="stat-amount text-error">
                  {{ statsLoading ? '—' : formatCurrency(stats.rejected.amount) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.count', { count: stats.rejected.count }) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="0" border>
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3">
              <v-avatar color="primary" variant="tonal" rounded size="44">
                <v-icon size="24">mdi-cash-multiple</v-icon>
              </v-avatar>
              <div class="stat-body">
                <div class="d-flex align-center ga-1">
                  <span class="text-caption text-medium-emphasis">
                    {{ $t('pendingReceipts.stats.total') }}
                  </span>
                  <v-icon size="14" class="text-medium-emphasis">mdi-information-outline</v-icon>
                  <v-tooltip activator="parent" location="top">
                    {{ $t('pendingReceipts.stats.totalHint') }}
                  </v-tooltip>
                </div>
                <div class="stat-amount text-primary">
                  {{ statsLoading ? '—' : formatCurrency(stats.total.amount) }}
                </div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('pendingReceipts.stats.count', { count: stats.total.count }) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title class="text-h5 pa-4 d-flex flex-wrap align-center justify-space-between ga-4">
        <span>{{ $t('pendingReceipts.title') }}</span>
        <v-btn
          v-if="canConfirmReceipt && pendingTotal > 0"
          color="success"
          variant="flat"
          prepend-icon="mdi-check-all"
          :disabled="processing"
          @click="openBulkDialog('all')"
        >
          {{
            $t('pendingReceipts.bulk.confirmAllCount', {
              count: pendingTotal,
              amount: formatCurrency(pendingTotalAmount),
            })
          }}
        </v-btn>
      </v-card-title>

      <!-- Belgilanganlar paneli -->
      <v-slide-y-transition>
        <div v-if="selectedIds.length > 0" class="selection-bar mx-4 mb-2 pa-3">
          <div class="d-flex flex-wrap align-center ga-3">
            <v-icon color="primary">mdi-checkbox-marked-circle-outline</v-icon>
            <span class="font-weight-medium">
              {{ $t('pendingReceipts.bulk.selected', { count: selectedIds.length }) }}
            </span>
            <span class="text-primary font-weight-bold">
              {{ formatCurrency(selectedAmount) }}
            </span>
            <v-spacer></v-spacer>
            <v-btn variant="text" size="small" :disabled="processing" @click="clearSelection">
              {{ $t('pendingReceipts.bulk.clearSelection') }}
            </v-btn>
            <v-btn
              v-if="canConfirmReceipt"
              color="success"
              variant="flat"
              size="small"
              prepend-icon="mdi-check"
              :disabled="processing"
              @click="openBulkDialog('selected')"
            >
              {{ $t('pendingReceipts.bulk.confirmSelected') }}
            </v-btn>
          </div>
        </div>
      </v-slide-y-transition>

      <!-- Jadval -->
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="pendingReceipts.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-receipt-text-check</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">
            {{ hasFilters ? $t('pendingReceipts.emptyFiltered') : $t('pendingReceipts.empty') }}
          </p>
        </div>

        <div v-else class="receipts-table-wrapper">
          <table class="receipts-table">
            <thead>
              <tr>
                <th v-if="canConfirmReceipt" class="checkbox-column">
                  <v-checkbox
                    :model-value="allOnPageSelected"
                    :indeterminate="someOnPageSelected"
                    hide-details
                    density="compact"
                    color="primary"
                    :disabled="processing"
                    @update:model-value="togglePageSelection"
                  ></v-checkbox>
                </th>
                <th>{{ $t('pendingReceipts.columns.student') }}</th>
                <th>{{ $t('pendingReceipts.columns.group') }}</th>
                <th>{{ $t('pendingReceipts.columns.month') }}</th>
                <th>{{ $t('common.sum') }}</th>
                <th>{{ $t('pendingReceipts.columns.receivedAt') }}</th>
                <th>{{ $t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="receipt in pendingReceipts"
                :key="receipt.id"
                :class="{ 'row-selected': isSelected(receipt.id) }"
              >
                <td v-if="canConfirmReceipt" class="checkbox-column">
                  <v-checkbox
                    :model-value="isSelected(receipt.id)"
                    hide-details
                    density="compact"
                    color="primary"
                    :disabled="processing"
                    @update:model-value="toggleSelection(receipt)"
                  ></v-checkbox>
                </td>
                <td>
                  <div class="student-name">
                    {{ `${receipt.payment.student.firstName} ${receipt.payment.student.lastName}` }}
                  </div>
                </td>
                <td>{{ receipt.payment.group?.name || '—' }}</td>
                <td>{{ formatMonth(receipt.payment.forMonth) }}</td>
                <td class="font-weight-bold text-primary">
                  {{ formatCurrency(parseFloat(receipt.amount)) }}
                </td>
                <td>{{ formatDate(receipt.receivedAt || receipt.createdAt) }}</td>
                <td>
                  <v-btn
                    v-if="canConfirmReceipt"
                    color="success"
                    size="small"
                    variant="flat"
                    @click="openConfirmDialog(receipt)"
                    :disabled="processing"
                    :loading="processingReceiptId === receipt.id"
                  >
                    {{ $t('pendingReceipts.approve') }}
                  </v-btn>
                  <v-btn
                    v-if="canRejectReceipt"
                    color="error"
                    size="small"
                    variant="tonal"
                    class="ms-2"
                    @click="openRejectDialog(receipt)"
                    :disabled="processing"
                    :loading="processingReceiptId === receipt.id"
                  >
                    {{ $t('pendingReceipts.reject') }}
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
          <v-pagination
            v-if="totalPages > 1"
            v-model="page"
            :length="totalPages"
            class="mt-4"
            @update:model-value="loadPendingReceipts"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <!-- Bitta to'lovni tasdiqlash -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> {{ $t('pendingReceipts.confirmTitle') }} </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            <strong
              >{{ confirmDialog.receipt?.payment.student.firstName }}
              {{ confirmDialog.receipt?.payment.student.lastName }}</strong
            >
            {{ $t('pendingReceipts.confirmQuestion') }}
          </p>
          <div class="mt-4">
            <div class="info-row mb-2">
              <span class="info-label">{{ $t('common.sum') }}:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(parseFloat(confirmDialog.receipt?.amount || '0')) }}
              </span>
            </div>
            <div class="info-row mb-2">
              <span class="info-label">{{ $t('pendingReceipts.columns.month') }}:</span>
              <span class="info-value">
                {{ formatMonth(confirmDialog.receipt?.payment.forMonth || '') }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDialog.show = false" :disabled="processing">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="success" variant="flat" @click="handleConfirmReceipt" :loading="processing">
            {{ $t('pendingReceipts.approve') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Chekni rad etish -->
    <v-dialog v-model="rejectDialog.show" max-width="420">
      <v-card>
        <v-card-title class="text-h6 pa-4">{{ $t('pendingReceipts.rejectTitle') }}</v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-4">
            <strong
              >{{ rejectDialog.receipt?.payment.student.firstName }}
              {{ rejectDialog.receipt?.payment.student.lastName }}</strong
            >
            {{ $t('pendingReceipts.rejectQuestion') }}
          </p>
          <v-textarea
            v-model="rejectDialog.reason"
            :label="$t('pendingReceipts.rejectReason')"
            variant="outlined"
            density="compact"
            rows="2"
            auto-grow
            hide-details="auto"
          ></v-textarea>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="rejectDialog.show = false" :disabled="processing">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="error" variant="flat" @click="handleRejectReceipt" :loading="processing">
            {{ $t('pendingReceipts.reject') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Ko'p / hammasini tasdiqlash -->
    <v-dialog v-model="bulkDialog.show" max-width="460">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{
            bulkDialog.mode === 'all'
              ? $t('pendingReceipts.bulk.allTitle')
              : $t('pendingReceipts.bulk.selectedTitle')
          }}
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-0">
            {{
              bulkDialog.mode === 'all'
                ? $t('pendingReceipts.bulk.allQuestion', {
                    count: pendingTotal,
                    amount: formatCurrency(pendingTotalAmount),
                  })
                : $t('pendingReceipts.bulk.selectedQuestion', {
                    count: selectedIds.length,
                    amount: formatCurrency(selectedAmount),
                  })
            }}
          </p>
          <v-alert
            v-if="bulkDialog.mode === 'all' && !hasFilters"
            type="warning"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            {{ $t('pendingReceipts.bulk.allNoFilterWarning') }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" :disabled="processing" @click="bulkDialog.show = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            prepend-icon="mdi-check-all"
            :loading="processing"
            @click="handleBulkConfirm"
          >
            {{ $t('pendingReceipts.approve') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" top>
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"> {{ $t('common.close') }} </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  PendingReceipt,
  PendingReceiptsParams,
  ConfirmReceiptsPayload,
  ReceiptsStatsResponse,
} from '@/types/payments.types'
import {
  fetchPendingReceipts,
  fetchReceiptsStats,
  confirmReceipt,
  confirmReceipts,
  rejectReceipt,
} from '@/services/pages/payments'

const { canConfirmReceipt, canRejectReceipt } = usePermissions()

const { t } = useI18n()

// Component name
defineOptions({
  name: 'PendingReceiptsPage',
})

// State
const pendingReceipts = ref<PendingReceipt[]>([])
const loading = ref(false)
const processing = ref(false)
const processingReceiptId = ref<number | null>(null)

// Server-side paginatsiya
const page = ref(1)
const perPage = 10
const totalPages = ref(1)
// Filterga mos BARCHA pending receiptlar soni va summasi ("Barchasini oldim" tugmasi uchun)
const pendingTotal = ref(0)
const pendingTotalAmount = ref(0)

// Filtrlar
const filters = ref({
  dateFrom: null as Date | string | null,
  dateTo: null as Date | string | null,
})

const hasFilters = computed(
  () => !!(filters.value.dateFrom || filters.value.dateTo),
)

// Statistika
const statsLoading = ref(false)
const emptyBucket = () => ({ count: 0, amount: 0 })
const stats = ref<ReceiptsStatsResponse>({
  confirmed: emptyBucket(),
  pending: emptyBucket(),
  rejected: emptyBucket(),
  total: emptyBucket(),
})

// Belgilangan cheklar — sahifalar orasida ham saqlanadi, shuning uchun
// summani hisoblash uchun to'liq obyektni eslab qolamiz.
const selected = ref<Map<number, PendingReceipt>>(new Map())
const selectedIds = computed(() => Array.from(selected.value.keys()))
const selectedAmount = computed(() =>
  Array.from(selected.value.values()).reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0),
)

const isSelected = (id: number) => selected.value.has(id)

const allOnPageSelected = computed(
  () => pendingReceipts.value.length > 0 && pendingReceipts.value.every((r) => isSelected(r.id)),
)

const someOnPageSelected = computed(
  () => !allOnPageSelected.value && pendingReceipts.value.some((r) => isSelected(r.id)),
)

const toggleSelection = (receipt: PendingReceipt) => {
  const next = new Map(selected.value)
  if (next.has(receipt.id)) {
    next.delete(receipt.id)
  } else {
    next.set(receipt.id, receipt)
  }
  selected.value = next
}

const togglePageSelection = (value: boolean | null) => {
  const next = new Map(selected.value)
  if (value) {
    pendingReceipts.value.forEach((r) => next.set(r.id, r))
  } else {
    pendingReceipts.value.forEach((r) => next.delete(r.id))
  }
  selected.value = next
}

const clearSelection = () => {
  selected.value = new Map()
}

// Dialoglar
const confirmDialog = ref({
  show: false,
  receipt: null as PendingReceipt | null,
})

const rejectDialog = ref({
  show: false,
  receipt: null as PendingReceipt | null,
  reason: '',
})

const bulkDialog = ref({
  show: false,
  mode: 'selected' as 'selected' | 'all',
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

// v-date-input Date qaytaradi — backend uchun YYYY-MM-DD ga o'giramiz.
const toApiDate = (value: Date | string | null): string | undefined => {
  if (!value) return undefined

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// Joriy filter holati — ro'yxat, statistika va "Barchasini oldim" aynan shu paramlarni ishlatadi.
const currentFilterParams = (): PendingReceiptsParams => {
  const params: PendingReceiptsParams = {}

  const dateFrom = toApiDate(filters.value.dateFrom)
  const dateTo = toApiDate(filters.value.dateTo)

  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo

  return params
}

// Methods
const loadPendingReceipts = async () => {
  loading.value = true
  try {
    const response = await fetchPendingReceipts({
      ...currentFilterParams(),
      page: page.value,
      perPage,
    })
    pendingReceipts.value = response.data || []

    const meta = response.meta
    totalPages.value = meta?.totalPages || 1
    pendingTotal.value = meta?.total ?? pendingReceipts.value.length
    pendingTotalAmount.value =
      meta?.totalAmount ??
      pendingReceipts.value.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0)

    if (page.value > totalPages.value) {
      page.value = 1
    }
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('pendingReceipts.loadError'), 'error')
    pendingReceipts.value = []
    totalPages.value = 1
    pendingTotal.value = 0
    pendingTotalAmount.value = 0
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  statsLoading.value = true
  try {
    stats.value = await fetchReceiptsStats(currentFilterParams())
  } catch (error: any) {
    console.error('Chek statistikasini yuklashda xatolik:', error)
    stats.value = {
      confirmed: emptyBucket(),
      pending: emptyBucket(),
      rejected: emptyBucket(),
      total: emptyBucket(),
    }
  } finally {
    statsLoading.value = false
  }
}

const reload = async () => {
  await Promise.all([loadPendingReceipts(), loadStats()])
}

const handleFilterChange = () => {
  const dateFrom = toApiDate(filters.value.dateFrom)
  const dateTo = toApiDate(filters.value.dateTo)

  if (dateFrom && dateTo && dateFrom > dateTo) {
    showSnackbar(t('pendingReceipts.filters.invalidRange'), 'error')
    return
  }

  page.value = 1
  clearSelection()
  reload()
}

const resetFilters = () => {
  filters.value = { dateFrom: null, dateTo: null }
  handleFilterChange()
}

const openConfirmDialog = (receipt: PendingReceipt) => {
  confirmDialog.value = {
    show: true,
    receipt,
  }
}

const handleConfirmReceipt = async () => {
  if (!confirmDialog.value.receipt) return

  const receiptId = confirmDialog.value.receipt.id
  processing.value = true
  processingReceiptId.value = receiptId
  try {
    await confirmReceipt(receiptId)
    showSnackbar(t('pendingReceipts.confirmSuccess'), 'success')
    confirmDialog.value.show = false
    const next = new Map(selected.value)
    next.delete(receiptId)
    selected.value = next
    await reload()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('pendingReceipts.confirmError'), 'error')
  } finally {
    processing.value = false
    processingReceiptId.value = null
  }
}

const openRejectDialog = (receipt: PendingReceipt) => {
  rejectDialog.value = { show: true, receipt, reason: '' }
}

const handleRejectReceipt = async () => {
  if (!rejectDialog.value.receipt) return

  const receiptId = rejectDialog.value.receipt.id
  processing.value = true
  processingReceiptId.value = receiptId
  try {
    await rejectReceipt(receiptId, rejectDialog.value.reason.trim() || undefined)
    showSnackbar(t('pendingReceipts.rejectSuccess'), 'success')
    rejectDialog.value.show = false
    const next = new Map(selected.value)
    next.delete(receiptId)
    selected.value = next
    await reload()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('pendingReceipts.rejectError'), 'error')
  } finally {
    processing.value = false
    processingReceiptId.value = null
  }
}

const openBulkDialog = (mode: 'selected' | 'all') => {
  if (mode === 'selected' && selectedIds.value.length === 0) {
    showSnackbar(t('pendingReceipts.bulk.nothingSelected'), 'error')
    return
  }
  bulkDialog.value = { show: true, mode }
}

const handleBulkConfirm = async () => {
  const mode = bulkDialog.value.mode

  // `all` bo'lsa filterni ham yuboramiz — backend aynan shu oraliqdagilarni tasdiqlaydi.
  const payload: ConfirmReceiptsPayload =
    mode === 'all' ? { all: true, ...currentFilterParams() } : { receiptIds: selectedIds.value }

  processing.value = true
  try {
    const result = await confirmReceipts(payload)

    if (result.confirmedCount > 0) {
      const hasProblems = result.skippedCount > 0 || result.failedCount > 0
      showSnackbar(
        hasProblems
          ? t('pendingReceipts.bulk.partial', {
              count: result.confirmedCount,
              skipped: result.skippedCount,
              failed: result.failedCount,
            })
          : t('pendingReceipts.bulk.success', {
              count: result.confirmedCount,
              amount: formatCurrency(result.confirmedAmount),
            }),
        hasProblems ? 'error' : 'success',
      )
    } else {
      showSnackbar(t('pendingReceipts.bulk.nothingConfirmed'), 'error')
    }

    bulkDialog.value.show = false
    clearSelection()
    await reload()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('pendingReceipts.bulk.error'), 'error')
  } finally {
    processing.value = false
  }
}

const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0) +
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
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatMonth = (monthString: string): string => {
  if (!monthString) return '—'
  const [year, month] = monthString.split('-')
  const monthNames = [
    t('pendingReceipts.months.january'),
    t('pendingReceipts.months.february'),
    t('pendingReceipts.months.march'),
    t('pendingReceipts.months.april'),
    t('pendingReceipts.months.may'),
    t('pendingReceipts.months.june'),
    t('pendingReceipts.months.july'),
    t('pendingReceipts.months.august'),
    t('pendingReceipts.months.september'),
    t('pendingReceipts.months.october'),
    t('pendingReceipts.months.november'),
    t('pendingReceipts.months.december'),
  ]
  return `${monthNames[parseInt(month) - 1]} ${year}`
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
  reload()
})
</script>

<style scoped>
.stat-card {
  height: 100%;
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px 0 rgba(46, 38, 61, 0.14) !important;
}

.stat-body {
  min-width: 0;
}

.stat-amount {
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.selection-bar {
  background-color: rgba(1, 192, 200, 0.08);
  border: 1px solid rgba(1, 192, 200, 0.24);
  border-radius: 6px;
}

.receipts-table-wrapper {
  overflow-x: auto;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.receipts-table {
  width: 100%;
  border-collapse: collapse;
}

.receipts-table thead {
  background-color: rgba(0, 0, 0, 0.05);
}

.receipts-table th,
.receipts-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.receipts-table th {
  font-weight: 500;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.receipts-table td {
  font-size: 0.875rem;
}

.receipts-table tbody tr.row-selected {
  background-color: rgba(1, 192, 200, 0.06);
}

.checkbox-column {
  width: 48px;
  padding-right: 0 !important;
}

.checkbox-column :deep(.v-selection-control) {
  min-height: unset;
}

.student-name {
  font-weight: 500;
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

@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
  .stat-card:hover {
    transform: none;
  }
}
</style>
