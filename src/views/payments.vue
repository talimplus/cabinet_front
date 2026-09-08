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
                  <div v-if="payment.lessonsExcused" class="text-caption text-info">
                    {{ $t('payments.table.excused', { count: payment.lessonsExcused }) }}
                  </div>
                </td>
                <td>
                  {{ formatCurrency(payment.amountDue) }}
                  <div
                    v-if="payment.refundedAmount && payment.refundedAmount > 0"
                    class="text-caption text-success"
                  >
                    {{
                      $t('payments.table.refunded', {
                        amount: formatCurrency(payment.refundedAmount),
                      })
                    }}
                  </div>
                  <div
                    v-if="payment.manualExcludedAmount && payment.manualExcludedAmount > 0"
                    class="text-caption text-warning"
                  >
                    {{
                      $t('payments.table.excluded', {
                        amount: formatCurrency(payment.manualExcludedAmount),
                      })
                    }}
                    <span v-if="payment.manualExcludedReason"
                      >({{ payment.manualExcludedReason }})</span
                    >
                  </div>
                </td>
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
                  <div class="d-flex align-center gap-2">
                    <template v-if="payment.status === PaymentStatus.PAID">
                      <v-icon color="success" size="small">mdi-check-circle</v-icon>
                      <span class="text-caption text-medium-emphasis">{{
                        $t('payments.status.paid')
                      }}</span>
                    </template>
                    <template v-else>
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
                    </template>

                    <!-- To'lov tarixi — to'lov qilingan bo'lsa istalgan vaqtda chek chop etish -->
                    <v-tooltip
                      v-if="hasPayments(payment)"
                      :text="$t('payments.history.title')"
                      location="top"
                    >
                      <template v-slot:activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          icon="mdi-history"
                          size="small"
                          variant="text"
                          color="primary"
                          @click="openHistoryModal(payment)"
                        ></v-btn>
                      </template>
                    </v-tooltip>
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
          <div class="mt-4 mb-4">
            <div class="info-row mb-2">
              <span class="info-label">{{ $t('payments.dialog.remainingSum') }}:</span>
              <span class="info-value font-weight-bold">
                {{ formatCurrency(markAsPaidDialog.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>

          <v-select
            v-model="markAsPaidDialog.paymentMethod"
            :items="paymentMethodOptions"
            item-title="title"
            item-value="value"
            :label="$t('payments.reception.paymentMethod')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-select>

          <!-- Karta bo'lsa — to'lov qilingan sana -->
          <v-text-field
            v-if="markAsPaidDialog.paymentMethod === 'card'"
            v-model="markAsPaidDialog.paidAt"
            :label="$t('payments.reception.paidAt')"
            placeholder="YYYY-MM-DD"
            persistent-placeholder
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-textarea
            v-model="markAsPaidDialog.comment"
            :label="$t('payments.reception.comment')"
            rows="2"
            variant="outlined"
            density="compact"
            auto-grow
            hide-details
          ></v-textarea>
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
              <span class="info-label">{{ $t('payments.dialog.lessonsBillable') }}:</span>
              <span class="info-value">
                {{ partialPaymentModal.payment?.lessonsBillable ?? '—' }}
                <template v-if="partialPaymentModal.payment?.lessonsPlanned != null">
                  / {{ partialPaymentModal.payment?.lessonsPlanned }}
                </template>
              </span>
            </div>
            <div v-if="partialPaymentModal.payment?.perLessonAmount != null" class="info-row mb-3">
              <span class="info-label">{{ $t('payments.exclusion.perLesson') }}:</span>
              <span class="info-value">
                {{ formatCurrency(partialPaymentModal.payment.perLessonAmount) }}
              </span>
            </div>
            <div v-if="partialPaymentModal.payment?.fullAmount != null" class="info-row mb-3">
              <span class="info-label">{{ $t('payments.exclusion.fullAmount') }}:</span>
              <span class="info-value">
                {{ formatCurrency(partialPaymentModal.payment.fullAmount) }}
              </span>
            </div>
            <div class="info-row mb-3">
              <span class="info-label">{{ $t('payments.dialog.remainingSum') }}:</span>
              <span class="info-value font-weight-bold text-primary">
                {{ formatCurrency(partialPaymentModal.payment?.remainingAmount || 0) }}
              </span>
            </div>
          </div>

          <!-- Darslarni/summani chiqarib tashlash (ixtiyoriy) -->
          <v-card variant="outlined" class="mb-4">
            <v-card-text class="pa-3">
              <div class="text-body-2 font-weight-medium mb-2">
                {{ $t('payments.exclusion.title') }}
              </div>
              <v-btn-toggle
                :model-value="partialPaymentModal.exclusionMode"
                @update:model-value="setExclusionMode"
                color="primary"
                density="compact"
                variant="outlined"
                divided
                class="mb-3"
              >
                <v-btn value="lessons" size="small">{{ $t('payments.exclusion.byLessons') }}</v-btn>
                <v-btn value="amount" size="small">{{ $t('payments.exclusion.byAmount') }}</v-btn>
              </v-btn-toggle>

              <v-text-field
                v-if="partialPaymentModal.exclusionMode === 'lessons'"
                v-model.number="partialPaymentModal.excludeLessons"
                :label="$t('payments.exclusion.excludeLessons')"
                type="number"
                :min="0"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3"
                @update:model-value="runExclusionPreview"
              ></v-text-field>

              <v-text-field
                v-if="partialPaymentModal.exclusionMode === 'amount'"
                v-model.number="partialPaymentModal.excludeAmount"
                :label="$t('payments.exclusion.excludeAmount')"
                type="number"
                :min="0"
                variant="outlined"
                density="compact"
                :suffix="$t('payments.dialog.sumSuffix')"
                hide-details
                class="mb-3"
                @update:model-value="runExclusionPreview"
              ></v-text-field>

              <!-- Chiqarib tashlash bo'lsa comment majburiy -->
              <v-textarea
                v-if="hasExclusion"
                v-model="partialPaymentModal.exclusionComment"
                :label="$t('payments.exclusion.comment')"
                rows="2"
                variant="outlined"
                density="compact"
                auto-grow
                :error-messages="exclusionCommentError"
                hide-details="auto"
                class="mb-2"
              ></v-textarea>

              <!-- Jonli hisob natijasi -->
              <div v-if="hasExclusion" class="mt-2">
                <div
                  v-if="partialPaymentModal.previewing"
                  class="text-caption text-medium-emphasis"
                >
                  {{ $t('payments.exclusion.calculating') }}
                </div>
                <template v-else-if="partialPaymentModal.exclusionPreview">
                  <div class="info-row mb-1">
                    <span class="info-label">{{ $t('payments.exclusion.excludedAmount') }}:</span>
                    <span class="info-value text-warning">
                      − {{ formatCurrency(partialPaymentModal.exclusionPreview.excludedAmount) }}
                    </span>
                  </div>
                  <div class="info-row mb-1">
                    <span class="info-label">{{ $t('payments.exclusion.newAmountDue') }}:</span>
                    <span class="info-value font-weight-medium">
                      {{ formatCurrency(partialPaymentModal.exclusionPreview.newAmountDue) }}
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label font-weight-bold"
                      >{{ $t('payments.exclusion.newRemaining') }}:</span
                    >
                    <span class="info-value font-weight-bold text-primary">
                      {{ formatCurrency(partialPaymentModal.exclusionPreview.newRemaining) }}
                    </span>
                  </div>
                </template>
              </div>
            </v-card-text>
          </v-card>

          <!-- Calculator Section -->
          <div class="mb-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-body-2 font-weight-medium">{{
                $t('payments.dialog.stopStudyDate')
              }}</span>
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
            <v-card-title class="text-subtitle-1 pa-3">
              {{ $t('payments.dialog.calcResults') }}
            </v-card-title>
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
              <div v-if="partialPaymentModal.calculation.lessonsExcused" class="info-row mb-2">
                <span class="info-label">{{ $t('payments.dialog.lessonsExcused') }}:</span>
                <span class="info-value text-info">
                  {{ partialPaymentModal.calculation.lessonsExcused }}
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
                <span class="info-label font-weight-bold"
                  >{{ $t('payments.dialog.difference') }}:</span
                >
                <span
                  class="info-value font-weight-bold"
                  :class="{
                    'text-success': partialPaymentModal.calculation.difference < 0,
                    'text-error': partialPaymentModal.calculation.difference > 0,
                  }"
                >
                  {{ formatCurrency(Math.abs(partialPaymentModal.calculation.difference)) }}
                  <span v-if="partialPaymentModal.calculation.difference < 0">
                    {{ $t('payments.dialog.refunded') }}</span
                  >
                  <span v-else-if="partialPaymentModal.calculation.difference > 0">
                    {{ $t('payments.dialog.additional') }}</span
                  >
                </span>
              </div>
            </v-card-text>
          </v-card>

          <!-- To'lov usuli -->
          <v-select
            v-model="partialPaymentModal.paymentMethod"
            :items="paymentMethodOptions"
            item-title="title"
            item-value="value"
            :label="$t('payments.reception.paymentMethod')"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-select>

          <!-- Karta bo'lsa — to'lov qilingan sana -->
          <v-text-field
            v-if="partialPaymentModal.paymentMethod === 'card'"
            v-model="partialPaymentModal.paidAt"
            :label="$t('payments.reception.paidAt')"
            placeholder="YYYY-MM-DD"
            persistent-placeholder
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
          ></v-text-field>

          <v-text-field
            v-model.number="partialPaymentModal.amount"
            :label="$t('payments.dialog.amountLabel')"
            type="number"
            variant="outlined"
            density="compact"
            :min="0.01"
            :max="effectiveRemaining"
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

    <!-- To'lovlar tarixi modali -->
    <PaymentHistoryModal
      v-model="historyModal.show"
      :payment="historyModal.payment"
      @print="openCheckModal"
    />

    <!-- Chek modali -->
    <CheckModal v-model="checkModal.show" :checks="checkModal.checks" />

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
import type {
  Payment,
  PaymentCalculationResponse,
  ExclusionPreviewResponse,
  PaymentMethod,
  PaymentCheck,
} from '@/types/payments.types'
import { PaymentStatus } from '@/types/payments.types'
import {
  fetchPayments,
  markAsPaid,
  payPartial,
  calculatePayment,
  updatePayment,
  previewExclusion,
  applyExclusion,
} from '@/services/pages/payments'
import { fetchAllGroups } from '@/services/pages/groups'
import type { Group } from '@/types/groups.types'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'
import CheckModal from '@/components/pages/payments/CheckModal.vue'
import PaymentHistoryModal from '@/components/pages/payments/PaymentHistoryModal.vue'

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
  paymentMethod: 'cash' as PaymentMethod,
  paidAt: null as string | null,
  comment: '',
})

const emptyPartialModal = () => ({
  show: false,
  payment: null as Payment | null,
  amount: 0 as number,
  plannedStudyUntilDate: null as string | null,
  showDatePicker: false as boolean,
  calculation: null as PaymentCalculationResponse | null,
  calculating: false as boolean,
  // To'lov usuli va (karta bo'lsa) to'lov qilingan sana
  paymentMethod: 'cash' as PaymentMethod,
  paidAt: null as string | null,
  // Darslarni/summani chiqarib tashlash
  exclusionMode: null as null | 'lessons' | 'amount',
  excludeLessons: null as number | null,
  excludeAmount: null as number | null,
  exclusionComment: '',
  exclusionPreview: null as ExclusionPreviewResponse | null,
  previewing: false as boolean,
})

const partialPaymentModal = ref(emptyPartialModal())

// To'lov usuli variantlari (reception)
const paymentMethodOptions = computed(() => [
  { title: t('payments.reception.method.cash'), value: 'cash' as PaymentMethod },
  { title: t('payments.reception.method.card'), value: 'card' as PaymentMethod },
  { title: t('payments.reception.method.bank_transfer'), value: 'bank_transfer' as PaymentMethod },
  { title: t('payments.reception.method.online'), value: 'online' as PaymentMethod },
])

// Chek modali — muvaffaqiyatli to'lovdan keyin ochiladi
const checkModal = ref({
  show: false,
  checks: [] as PaymentCheck[],
})

const openCheckModal = (checks: (PaymentCheck | undefined)[]) => {
  const valid = checks.filter((c): c is PaymentCheck => !!c)
  if (valid.length === 0) return
  checkModal.value = { show: true, checks: valid }
}

// To'lovlar tarixi modali — chekni istalgan vaqtda qayta chop etish uchun
const historyModal = ref({
  show: false,
  payment: null as Payment | null,
})

// Tarix tugmasi faqat to'lov qilingan (yoki tasdiq kutayotgan) qatorlarda ko'rinadi
const hasPayments = (payment: Payment): boolean =>
  (payment.amountPaid || 0) > 0 || !!payment.hasPendingReceipt

const openHistoryModal = (payment: Payment) => {
  historyModal.value = { show: true, payment }
}

// Chiqarib tashlash uchun preview debounce timer'i
let previewTimer: ReturnType<typeof setTimeout> | null = null

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

// Chiqarib tashlash kiritilganmi (tanlangan rejimga mos qiymat > 0)
const hasExclusion = computed(() => {
  const m = partialPaymentModal.value
  if (m.exclusionMode === 'lessons') return (m.excludeLessons || 0) > 0
  if (m.exclusionMode === 'amount') return (m.excludeAmount || 0) > 0
  return false
})

// Chiqarib tashlashda comment majburiy
const exclusionCommentError = computed<string[]>(() => {
  if (hasExclusion.value && !partialPaymentModal.value.exclusionComment.trim()) {
    return [t('payments.exclusion.commentRequired')]
  }
  return []
})

// Chiqarib tashlashdan keyingi qolgan qarz (preview bo'lsa undan, aks holda joriy remaining)
const effectiveRemaining = computed(() => {
  if (hasExclusion.value && partialPaymentModal.value.exclusionPreview) {
    return partialPaymentModal.value.exclusionPreview.newRemaining
  }
  return remainingAmount.value
})

const amountError = computed(() => {
  if (!partialPaymentModal.value.amount) return []
  if (partialPaymentModal.value.amount <= 0) return [t('payments.validation.amountGreaterThanZero')]
  if (partialPaymentModal.value.amount > effectiveRemaining.value) {
    return [
      t('payments.validation.amountNotExceedWithSum', {
        amount: formatCurrency(effectiveRemaining.value),
      }),
    ]
  }
  return []
})

const amountRules = [
  (v: number) => v > 0 || t('payments.validation.amountGreaterThanZero'),
  (v: number) =>
    v <= effectiveRemaining.value ||
    t('payments.validation.amountNotExceed', { amount: formatCurrency(effectiveRemaining.value) }),
]

const canProcessPartialPayment = computed(() => {
  return (
    partialPaymentModal.value.amount > 0 &&
    partialPaymentModal.value.amount <= effectiveRemaining.value &&
    amountError.value.length === 0 &&
    exclusionCommentError.value.length === 0
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
    paymentMethod: 'cash',
    paidAt: null,
    comment: '',
  }
}

const confirmMarkAsPaid = async () => {
  const dialog = markAsPaidDialog.value
  if (!dialog.payment) return

  processingPayment.value = true
  try {
    const response = await markAsPaid(dialog.payment.id, {
      paymentMethod: dialog.paymentMethod,
      paidAt: dialog.paymentMethod === 'card' && dialog.paidAt ? dialog.paidAt : undefined,
      comment: dialog.comment.trim() || undefined,
    })
    showSnackbar(t('payments.messages.markSuccess'), 'success')
    markAsPaidDialog.value.show = false
    await loadPayments()
    openCheckModal([response?.check])
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('payments.messages.markError'), 'error')
  } finally {
    processingPayment.value = false
  }
}

const openPartialPaymentModal = (payment: Payment) => {
  partialPaymentModal.value = { ...emptyPartialModal(), show: true, payment }
}

const closePartialPaymentModal = () => {
  if (processingPayment.value) return
  if (previewTimer) clearTimeout(previewTimer)
  partialPaymentModal.value = emptyPartialModal()
}

// Chiqarib tashlash rejimini tanlash (boshqa rejim inputini tozalaymiz)
const setExclusionMode = (mode: 'lessons' | 'amount' | null | undefined) => {
  const m = partialPaymentModal.value
  m.exclusionMode = mode ?? null
  m.excludeLessons = null
  m.excludeAmount = null
  m.exclusionPreview = null
  if (!mode) m.exclusionComment = ''
  runExclusionPreview()
}

// Kiritilgan chiqarib tashlashni jonli hisoblash (preview-exclusion, debounce bilan)
const runExclusionPreview = () => {
  if (previewTimer) clearTimeout(previewTimer)
  const m = partialPaymentModal.value
  if (!m.payment || !hasExclusion.value) {
    m.exclusionPreview = null
    return
  }
  previewTimer = setTimeout(async () => {
    const payment = partialPaymentModal.value.payment
    if (!payment) return
    partialPaymentModal.value.previewing = true
    try {
      const payload =
        partialPaymentModal.value.exclusionMode === 'lessons'
          ? { excludeLessons: partialPaymentModal.value.excludeLessons || 0 }
          : { excludeAmount: partialPaymentModal.value.excludeAmount || 0 }
      const preview = await previewExclusion(payment.id, payload)
      partialPaymentModal.value.exclusionPreview = preview
      // Qolgan qarzni yangi qiymatga moslaymiz (reception odatda to'liq oladi)
      partialPaymentModal.value.amount = preview.newRemaining
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || t('payments.messages.calcError'), 'error')
      partialPaymentModal.value.exclusionPreview = null
    } finally {
      partialPaymentModal.value.previewing = false
    }
  }, 400)
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
  const modal = partialPaymentModal.value
  if (!modal.payment) return

  // Chiqarib tashlash bo'lsa comment majburiy
  if (hasExclusion.value && exclusionCommentError.value.length > 0) {
    showSnackbar(exclusionCommentError.value[0], 'error')
    return
  }

  processingPayment.value = true
  try {
    if (!modal.amount || modal.amount <= 0) {
      showSnackbar(t('payments.messages.enterValidAmount'), 'error')
      return
    }
    if (modal.amount > effectiveRemaining.value) {
      showSnackbar(t('payments.messages.amountExceeds'), 'error')
      return
    }

    // If plannedStudyUntilDate is set, update payment first
    if (modal.plannedStudyUntilDate) {
      await updatePayment(modal.payment.id, {
        plannedStudyUntilDate: modal.plannedStudyUntilDate,
      })
    }

    // Chiqarib tashlash kiritilgan bo'lsa — avval saqlaymiz (amountDue kamayadi)
    const comment = modal.exclusionComment.trim()
    if (hasExclusion.value) {
      const payload =
        modal.exclusionMode === 'lessons'
          ? { excludeLessons: modal.excludeLessons || 0, comment }
          : { excludeAmount: modal.excludeAmount || 0, comment }
      await applyExclusion(modal.payment.id, payload)
    }

    // Keyin to'lovni qabul qilamiz (to'lov usuli, sana va comment bilan)
    const response = await payPartial(modal.payment.id, modal.amount, {
      paymentMethod: modal.paymentMethod,
      paidAt: modal.paymentMethod === 'card' && modal.paidAt ? modal.paidAt : undefined,
      comment: comment || undefined,
    })
    showSnackbar(
      t('payments.messages.partialSuccess', {
        amount: formatCurrency(modal.amount),
      }),
      'success',
    )
    if (previewTimer) clearTimeout(previewTimer)
    partialPaymentModal.value = emptyPartialModal()
    await loadPayments()
    openCheckModal([response?.check])
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
