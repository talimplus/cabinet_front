<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Statistika Dashboard</span>
      </v-card-title>
      
      <v-card-text>
        <!-- Filters -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.centerId"
              :items="centerOptions"
              item-title="title"
              item-value="value"
              label="Markaz"
              variant="outlined"
              density="compact"
              @update:model-value="loadDashboard"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.fromMonth"
              label="Boshlanish oyi"
              type="month"
              variant="outlined"
              density="compact"
              @update:model-value="loadDashboard"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.toMonth"
              label="Tugash oyi"
              type="month"
              variant="outlined"
              density="compact"
              @update:model-value="loadDashboard"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </div>

        <!-- Dashboard Content -->
        <div v-else-if="dashboard">
          <!-- Net Cashflow Card -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-card :color="dashboard.netCashflow >= 0 ? 'success' : 'error'" variant="tonal">
                <v-card-text>
                  <div class="d-flex align-center justify-space-between">
                    <div>
                      <div class="text-caption text-medium-emphasis">Jami pul oqimi</div>
                      <div class="text-h4 font-weight-bold">
                        {{ formatCurrency(dashboard.netCashflow) }}
                      </div>
                    </div>
                    <v-icon size="64" :color="dashboard.netCashflow >= 0 ? 'success' : 'error'">
                      {{ dashboard.netCashflow >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                    </v-icon>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Statistics Cards -->
          <v-row>
            <!-- Payments -->
            <v-col cols="12" md="6" lg="3">
              <v-card>
                <v-card-title class="text-subtitle-1">To'lovlar</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Jami qarzdorlik</div>
                    <div class="text-h6">{{ formatCurrency(dashboard.payments.amountDue) }}</div>
                  </div>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">To'langan</div>
                    <div class="text-h6 text-success">{{ formatCurrency(dashboard.payments.amountPaid) }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Qolgan</div>
                    <div class="text-h6 text-error">{{ formatCurrency(dashboard.payments.remainingAmount) }}</div>
                  </div>
                  <v-progress-linear
                    :model-value="getPercentage(dashboard.payments.amountPaid, dashboard.payments.amountDue)"
                    color="success"
                    height="8"
                    class="mt-3"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Expenses -->
            <v-col cols="12" md="6" lg="3">
              <v-card>
                <v-card-title class="text-subtitle-1">Chiqimlar</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Jami summa</div>
                    <div class="text-h6 text-error">{{ formatCurrency(dashboard.expenses.totalAmount) }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Jami soni</div>
                    <div class="text-h6">{{ dashboard.expenses.totalCount }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Payroll -->
            <v-col cols="12" md="6" lg="3">
              <v-card>
                <v-card-title class="text-subtitle-1">Ish haqi</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Jami qarzdorlik</div>
                    <div class="text-h6">{{ formatCurrency(dashboard.payroll.amountDue) }}</div>
                  </div>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">To'langan</div>
                    <div class="text-h6 text-success">{{ formatCurrency(dashboard.payroll.amountPaid) }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">Qolgan</div>
                    <div class="text-h6 text-error">{{ formatCurrency(dashboard.payroll.remainingAmount) }}</div>
                  </div>
                  <v-progress-linear
                    :model-value="getPercentage(dashboard.payroll.amountPaid, dashboard.payroll.amountDue)"
                    color="success"
                    height="8"
                    class="mt-3"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Students -->
            <v-col cols="12" md="6" lg="3">
              <v-card>
                <v-card-title class="text-subtitle-1">O'quvchilar</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Jami</div>
                    <div class="text-h6">{{ dashboard.students.totalCount }}</div>
                  </div>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Faol</div>
                    <div class="text-h6 text-success">{{ dashboard.students.activeCount }}</div>
                  </div>
                  <div class="mb-2">
                    <div class="text-caption text-medium-emphasis">Qo'shilgan</div>
                    <div class="text-h6 text-info">{{ dashboard.students.addedCount }}</div>
                  </div>
                  <div>
                    <div class="text-caption text-medium-emphasis">To'xtatilgan</div>
                    <div class="text-h6 text-error">{{ dashboard.students.stoppedCount }}</div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Comparison Charts -->
          <v-row class="mt-4">
            <!-- Payments vs Expenses -->
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="text-subtitle-1">To'lovlar vs Chiqimlar</v-card-title>
                <v-card-text>
                  <div class="d-flex align-center justify-space-between mb-4">
                    <div>
                      <div class="text-caption text-medium-emphasis">To'langan to'lovlar</div>
                      <div class="text-h6 text-success">{{ formatCurrency(dashboard.payments.amountPaid) }}</div>
                    </div>
                    <div>
                      <div class="text-caption text-medium-emphasis">Jami chiqimlar</div>
                      <div class="text-h6 text-error">{{ formatCurrency(dashboard.expenses.totalAmount) }}</div>
                    </div>
                  </div>
                  <v-progress-linear
                    :model-value="getPercentage(dashboard.payments.amountPaid, dashboard.payments.amountPaid + dashboard.expenses.totalAmount)"
                    color="success"
                    height="20"
                    class="mb-2"
                  ></v-progress-linear>
                  <v-progress-linear
                    :model-value="getPercentage(dashboard.expenses.totalAmount, dashboard.payments.amountPaid + dashboard.expenses.totalAmount)"
                    color="error"
                    height="20"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Students Status -->
            <v-col cols="12" md="6">
              <v-card>
                <v-card-title class="text-subtitle-1">O'quvchilar holati</v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Faol</span>
                      <span class="text-caption font-weight-bold">{{ dashboard.students.activeCount }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.students.activeCount, dashboard.students.totalCount)"
                      color="success"
                      height="12"
                    ></v-progress-linear>
                  </div>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Qo'shilgan</span>
                      <span class="text-caption font-weight-bold">{{ dashboard.students.addedCount }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.students.addedCount, dashboard.students.totalCount)"
                      color="info"
                      height="12"
                    ></v-progress-linear>
                  </div>
                  <div>
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">To'xtatilgan</span>
                      <span class="text-caption font-weight-bold">{{ dashboard.students.stoppedCount }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.students.stoppedCount, dashboard.students.totalCount)"
                      color="error"
                      height="12"
                    ></v-progress-linear>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <v-icon size="64" color="grey">mdi-chart-line</v-icon>
          <div class="text-h6 mt-4 text-medium-emphasis">Ma'lumotlar topilmadi</div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchDashboard } from '@/services/pages/statistics'
import type { DashboardResponse, DashboardParams } from '@/types/statistics.types'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/center.types'
import dayjs from 'dayjs'

const loading = ref(false)
const dashboard = ref<DashboardResponse | null>(null)
const centers = ref<Center[]>([])

const filters = ref<DashboardParams>({
  centerId: undefined,
  fromMonth: dayjs().format('YYYY-MM'),
  toMonth: dayjs().add(1, 'month').format('YYYY-MM'),
})

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
}

const getPercentage = (value: number, total: number): number => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const loadCenters = async () => {
  try {
    const { data } = await fetchAllCenters()
    centers.value = data
    if (centers.value.length > 0 && !filters.value.centerId) {
      const defaultCenter = centers.value.find(c => c.isDefault) || centers.value[0]
      filters.value.centerId = defaultCenter.id
    }
  } catch (error) {
    console.error('Failed to load centers:', error)
  }
}

const loadDashboard = async () => {
  if (!filters.value.centerId) return
  
  loading.value = true
  try {
    const data = await fetchDashboard(filters.value)
    dashboard.value = data
  } catch (error: any) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCenters()
  if (filters.value.centerId) {
    await loadDashboard()
  }
})
</script>

<style scoped>
.v-card {
  height: 100%;
}
</style>
