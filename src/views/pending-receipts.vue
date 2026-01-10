<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4"> Tasdiqlash uchun kelgan to'lovlar </v-card-title>

      <!-- Payments Table -->
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="pendingReceipts.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-receipt-text-check</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">
            Tasdiqlash uchun kelgan to'lovlar topilmadi
          </p>
        </div>

        <div v-else class="receipts-table-wrapper">
          <table class="receipts-table">
            <thead>
              <tr>
                <th>O'quvchi</th>
                <th>Guruh</th>
                <th>Oy</th>
                <th>Summa</th>
                <th>Yaratilgan sana</th>
                <th>Amallar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="receipt in pendingReceipts" :key="receipt.id">
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
                <td>{{ formatDate(receipt.createdAt) }}</td>
                <td>
                  <v-btn
                    color="success"
                    size="small"
                    variant="flat"
                    @click="openConfirmDialog(receipt)"
                    :disabled="processing"
                    :loading="processingReceiptId === receipt.id"
                  >
                    Tasdiqlash
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card-text>
    </v-card>

    <!-- Confirm Receipt Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> To'lovni tasdiqlash </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            <strong
              >{{ confirmDialog.receipt?.payment.student.firstName }}
              {{ confirmDialog.receipt?.payment.student.lastName }}</strong
            >
            uchun to'lovni tasdiqlaysizmi?
          </p>
          <div class="mt-4">
            <div class="info-row mb-2">
              <span class="info-label">Summa:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(parseFloat(confirmDialog.receipt?.amount || '0')) }}
              </span>
            </div>
            <div class="info-row mb-2">
              <span class="info-label">Oy:</span>
              <span class="info-value">
                {{ formatMonth(confirmDialog.receipt?.payment.forMonth || '') }}
              </span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmDialog.show = false" :disabled="processing">
            Bekor qilish
          </v-btn>
          <v-btn
            color="success"
            variant="flat"
            @click="handleConfirmReceipt"
            :loading="processing"
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
import { ref, onMounted } from 'vue'
import type { PendingReceipt } from '@/types/payments.types'
import { fetchPendingReceipts, confirmReceipt } from '@/services/pages/payments'

// Component name
defineOptions({
  name: 'PendingReceiptsPage',
})

// State
const pendingReceipts = ref<PendingReceipt[]>([])
const loading = ref(false)
const processing = ref(false)
const processingReceiptId = ref<number | null>(null)

// Dialog
const confirmDialog = ref({
  show: false,
  receipt: null as PendingReceipt | null,
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success' as 'success' | 'error',
})

// Methods
const loadPendingReceipts = async () => {
  loading.value = true
  try {
    const response = await fetchPendingReceipts()
    pendingReceipts.value = response.data || []
  } catch (error: any) {
    showSnackbar(
      error.response?.data?.message || "Tasdiqlash uchun kelgan to'lovlarni yuklashda xatolik",
      'error',
    )
    pendingReceipts.value = []
  } finally {
    loading.value = false
  }
}

const openConfirmDialog = (receipt: PendingReceipt) => {
  confirmDialog.value = {
    show: true,
    receipt,
  }
}

const handleConfirmReceipt = async () => {
  if (!confirmDialog.value.receipt) return

  processing.value = true
  processingReceiptId.value = confirmDialog.value.receipt.id
  try {
    await confirmReceipt(confirmDialog.value.receipt.id)
    showSnackbar('To\'lov muvaffaqiyatli tasdiqlandi', 'success')
    confirmDialog.value.show = false
    await loadPendingReceipts()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || "To'lovni tasdiqlashda xatolik", 'error')
  } finally {
    processing.value = false
    processingReceiptId.value = null
  }
}

const formatCurrency = (amount: number): string => {
  return (
    new Intl.NumberFormat('uz-UZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + " so'm"
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
    'Yanvar',
    'Fevral',
    'Mart',
    'Aprel',
    'May',
    'Iyun',
    'Iyul',
    'Avgust',
    'Sentabr',
    'Oktabr',
    'Noyabr',
    'Dekabr',
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
  loadPendingReceipts()
})
</script>

<style scoped>
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
</style>
