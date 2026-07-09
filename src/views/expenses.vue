<template>
  <v-container fluid>
    <v-card>
      <v-card-title class="text-h5 pa-4 d-flex justify-space-between">
        {{ $t('expenses.title') }}
        <v-btn color="primary" @click="openCreateModal">{{ $t('common.create') }}</v-btn>
      </v-card-title>

      <!-- Filters -->
      <v-card-text class="pb-2">
        <v-row>
          <v-col cols="12" md="3">
            <v-select
              v-model="selectedYear"
              :items="yearOptions"
              :label="$t('expenses.year')"
              variant="outlined"
              density="compact"
              @update:model-value="handleYearChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="params.centerId"
              :items="centerOptions"
              :label="$t('expenses.center')"
              variant="outlined"
              density="compact"
              clearable
              :loading="loadingCenters"
              @update:model-value="handleFilterChange"
            ></v-select>
          </v-col>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="params.search"
              :label="$t('common.search')"
              :placeholder="$t('expenses.searchPlaceholder')"
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

      <!-- Expenses Table -->
      <v-card-text>
        <div v-if="loading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <div v-else-if="expenses.length === 0" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1">mdi-cash-off</v-icon>
          <p class="text-h6 mt-4 text-medium-emphasis">{{ $t('expenses.noExpensesForMonth') }}</p>
        </div>

        <div v-else>
          <v-data-table :items="expenses" :headers="headers" hide-default-footer>
            <template v-slot:item.amount="{ item }">
              {{ formatCurrency(item.amount) }}
            </template>
            <template v-slot:item.forMonth="{ item }">
              {{ formatMonth(item.forMonth) }}
            </template>
            <template v-slot:item.createdAt="{ item }">
              {{ formatDate(item.createdAt) }}
            </template>
            <template v-slot:item.center="{ item }">
              {{ item.center?.name || '—' }}
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn
                @click="editExpense(item)"
                density="compact"
                color="primary"
                icon="mdi-pencil"
                size="small"
                class="me-2"
                variant="text"
              ></v-btn>
              <v-btn
                @click="openDeleteDialog(item)"
                density="compact"
                color="error"
                icon="mdi-delete"
                size="small"
                variant="text"
              ></v-btn>
            </template>
          </v-data-table>
          <v-pagination
            v-model="params.page"
            :length="totalPages"
            class="mt-4"
            @update:model-value="handlePageChange"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Expense Modal -->
    <v-dialog v-model="expenseModal.show" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ expenseModal.isEdit ? $t('expenses.editTitle') : $t('expenses.createTitle') }}
        </v-card-title>
        <Form ref="expenseFormRef" @submit="saveExpense">
          <v-card-text class="pa-4">
            <Field name="centerId" v-slot="{ handleChange, handleBlur, errors }">
              <v-select
                v-model="expenseForm.centerId"
                :items="centerOptions"
                :label="$t('expenses.center')"
                variant="outlined"
                density="compact"
                class="mb-1"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-select>
            </Field>

            <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
              <v-text-field
                v-model="expenseForm.name"
                :label="$t('expenses.expenseName')"
                variant="outlined"
                density="compact"
                class="mb-1"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-text-field>
            </Field>

            <Field name="amount" v-slot="{ handleChange, handleBlur, errors }">
              <v-text-field
                v-model.number="expenseForm.amount"
                :label="$t('common.amount')"
                type="number"
                variant="outlined"
                density="compact"
                :suffix="$t('common.sum')"
                class="mb-1"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-text-field>
            </Field>

            <Field name="description" v-slot="{ handleChange, handleBlur, errors }">
              <v-textarea
                v-model="expenseForm.description"
                :label="$t('common.description')"
                variant="outlined"
                density="compact"
                rows="3"
                class="mb-1"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-textarea>
            </Field>

            <Field name="forMonth" v-slot="{ handleChange, handleBlur, errors }">
              <v-select
                v-model="expenseForm.forMonth"
                :items="monthOptions"
                :label="$t('expenses.month')"
                variant="outlined"
                density="compact"
                :error-messages="errors"
                @update:model-value="handleChange"
                @blur="handleBlur"
              ></v-select>
            </Field>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeExpenseModal" :disabled="processing">
              {{ $t('common.cancel') }}
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              type="submit"
              :loading="processing"
            >
              {{ $t('common.save') }}
            </v-btn>
          </v-card-actions>
        </Form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-4"> {{ $t('expenses.deleteTitle') }} </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1">
            <strong>{{ deleteDialog.expense?.name }}</strong> {{ $t('expenses.deleteConfirmSuffix') }}
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="deleteDialog.show = false" :disabled="processing">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            @click="confirmDelete"
            :loading="processing"
          >
            {{ $t('common.delete') }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Form, Field } from 'vee-validate'
import type { Expense, ExpenseForm, ExpensesParams } from '@/types/expenses.types'
import { fetchExpenses, fetchExpenseById, createExpense, updateExpense, deleteExpense } from '@/services/pages/expenses'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'

// Component name
defineOptions({
  name: 'ExpensesPage',
})

const { t } = useI18n()

// State
const selectedYear = ref(new Date().getFullYear())
const selectedMonthIndex = ref(new Date().getMonth())
const expenses = ref<Expense[]>([])
const centers = ref<Center[]>([])
const loading = ref(false)
const loadingCenters = ref(false)
const processing = ref(false)
const totalPages = ref(1)

const params = ref<ExpensesParams>({
  page: 1,
  perPage: 10,
  forMonth: undefined,
  centerId: undefined,
  search: undefined,
})

// Expense Modal
const expenseModal = ref({
  show: false,
  isEdit: false,
  expenseId: null as number | null,
})

const expenseForm = ref<ExpenseForm>({
  centerId: 0,
  name: '',
  amount: 0,
  description: '',
  forMonth: '',
})

const expenseFormRef = ref()

// Delete Dialog
const deleteDialog = ref({
  show: false,
  expense: null as Expense | null,
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
  { label: t('expenses.months.01'), value: '01' },
  { label: t('expenses.months.02'), value: '02' },
  { label: t('expenses.months.03'), value: '03' },
  { label: t('expenses.months.04'), value: '04' },
  { label: t('expenses.months.05'), value: '05' },
  { label: t('expenses.months.06'), value: '06' },
  { label: t('expenses.months.07'), value: '07' },
  { label: t('expenses.months.08'), value: '08' },
  { label: t('expenses.months.09'), value: '09' },
  { label: t('expenses.months.10'), value: '10' },
  { label: t('expenses.months.11'), value: '11' },
  { label: t('expenses.months.12'), value: '12' },
])

const availableMonths = computed(() => {
  const months = []
  const maxMonth = selectedYear.value === currentYear.value ? currentMonth.value + 1 : 12

  for (let i = 0; i < maxMonth; i++) {
    months.push(monthNames.value[i])
  }

  return months
})

const selectedMonth = computed(() => {
  return availableMonths.value[selectedMonthIndex.value]?.value || monthNames.value[currentMonth.value].value
})

const forMonth = computed(() => {
  return `${selectedYear.value}-${selectedMonth.value}`
})

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

const monthOptions = computed(() => {
  const options = []
  const now = new Date()
  const currentYearNum = now.getFullYear()
  const currentMonthNum = now.getMonth() + 1 // 1-12
  
  for (let year = currentYearNum - 1; year <= currentYearNum; year++) {
    const maxMonth = year === currentYearNum ? currentMonthNum : 12
    for (let month = 1; month <= maxMonth; month++) {
      const monthValue = `${year}-${String(month).padStart(2, '0')}`
      const monthLabel = `${monthNames.value[month - 1].label} ${year}`
      options.push({ title: monthLabel, value: monthValue })
    }
  }
  return options
})

const headers = computed(() => [
  { title: 'ID', key: 'id' },
  { title: t('expenses.name'), key: 'name' },
  { title: t('expenses.center'), key: 'center' },
  { title: t('common.amount'), key: 'amount' },
  { title: t('common.description'), key: 'description' },
  { title: t('expenses.month'), key: 'forMonth' },
  { title: t('expenses.day'), key: 'createdAt' },
  { title: t('common.actions'), key: 'actions' },
])

// Methods
const isPastMonth = (monthValue: string): boolean => {
  const month = parseInt(monthValue) - 1
  if (selectedYear.value < currentYear.value) return true
  if (selectedYear.value === currentYear.value && month < currentMonth.value) return true
  return false
}

const loadExpenses = async () => {
  loading.value = true
  try {
    const queryParams: ExpensesParams = {
      page: params.value.page,
      perPage: params.value.perPage,
      forMonth: forMonth.value,
    }

    if (params.value.centerId) {
      queryParams.centerId = params.value.centerId
    }

    if (params.value.search) {
      queryParams.search = params.value.search
    }

    const response = await fetchExpenses(queryParams)
    expenses.value = response.data || []
    totalPages.value = response.meta?.totalPages || 1
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('expenses.errors.loadExpenses'), 'error')
    expenses.value = []
  } finally {
    loading.value = false
  }
}

const loadCenters = async () => {
  loadingCenters.value = true
  try {
    const response = await fetchAllCenters()
    centers.value = response.data || []
    if (centers.value.length > 0 && !params.value.centerId) {
      const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
      params.value.centerId = defaultCenter.id
      // Load expenses after setting default center
      await loadExpenses()
    }
  } catch (error: any) {
    console.error('Markazlarni yuklashda xatolik:', error)
    centers.value = []
  } finally {
    loadingCenters.value = false
  }
}

const handleYearChange = () => {
  if (selectedMonthIndex.value >= availableMonths.value.length) {
    selectedMonthIndex.value = 0
  }
  params.value.page = 1
  loadExpenses()
}

const handleMonthChange = () => {
  params.value.page = 1
  loadExpenses()
}

const handleFilterChange = () => {
  params.value.page = 1
  loadExpenses()
}

const handlePageChange = () => {
  loadExpenses()
}

const openCreateModal = () => {
  expenseModal.value = {
    show: true,
    isEdit: false,
    expenseId: null,
  }
  const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
  expenseForm.value = {
    centerId: defaultCenter?.id || 0,
    name: '',
    amount: 0,
    description: '',
    forMonth: forMonth.value,
  }
}

const editExpense = async (expense: Expense) => {
  try {
    const expenseData = await fetchExpenseById(expense.id)
    expenseModal.value = {
      show: true,
      isEdit: true,
      expenseId: expense.id,
    }
    // Handle forMonth format: YYYY-MM-DD -> YYYY-MM or keep YYYY-MM
    const forMonthValue = expenseData.forMonth?.length > 7 
      ? expenseData.forMonth.substring(0, 7) 
      : expenseData.forMonth || ''
    
    expenseForm.value = {
      centerId: expenseData.centerId,
      name: expenseData.name || '',
      amount: expenseData.amount || 0,
      description: expenseData.description || '',
      forMonth: forMonthValue,
    }
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('expenses.errors.loadExpense'), 'error')
  }
}

const closeExpenseModal = () => {
  if (processing.value) return
  expenseModal.value.show = false
  expenseForm.value = {
    centerId: 0,
    name: '',
    amount: 0,
    description: '',
    forMonth: '',
  }
}

const saveExpense = async () => {
  processing.value = true
  try {
    if (expenseModal.value.isEdit && expenseModal.value.expenseId) {
      await updateExpense(expenseModal.value.expenseId, expenseForm.value)
      showSnackbar(t('expenses.messages.updated'), 'success')
    } else {
      await createExpense(expenseForm.value)
      showSnackbar(t('expenses.messages.created'), 'success')
    }
    await loadExpenses()
    expenseModal.value.show = false
    expenseForm.value = {
      centerId: 0,
      name: '',
      amount: 0,
      description: '',
      forMonth: '',
    }
  } catch (error: any) {
    const errors = error?.response?.data?.errors
    if (errors) {
      expenseFormRef.value?.setErrors(errors)
    }
    showSnackbar(error.response?.data?.message || t('expenses.errors.save'), 'error')
  } finally {
    processing.value = false
  }
}

const openDeleteDialog = (expense: Expense) => {
  deleteDialog.value = {
    show: true,
    expense,
  }
}

const confirmDelete = async () => {
  if (!deleteDialog.value.expense) return

  processing.value = true
  try {
    await deleteExpense(deleteDialog.value.expense.id)
    showSnackbar(t('expenses.messages.deleted'), 'success')
    deleteDialog.value.show = false
    await loadExpenses()
  } catch (error: any) {
    showSnackbar(error.response?.data?.message || t('expenses.errors.delete'), 'error')
  } finally {
    processing.value = false
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

const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.substring(0, 7).split('-')
  const monthIndex = parseInt(month) - 1
  return `${monthNames.value[monthIndex]?.label || month} ${year}`
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

// Watch for month changes
watch(() => forMonth.value, () => {
  if (expenseForm.value.forMonth === '') {
    expenseForm.value.forMonth = forMonth.value
  }
})

// Lifecycle
onMounted(async () => {
  await loadCenters()
  // If centerId is set, loadExpenses is already called in loadCenters
  // Otherwise load expenses without center filter
  if (!params.value.centerId) {
    loadExpenses()
  }
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
