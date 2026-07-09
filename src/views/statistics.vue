<template>
  <div class="statistics-page">
    <!-- Page header -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('statistics.title') }}</h1>
      <p class="page-subtitle">{{ $t('statistics.subtitle') }}</p>
    </div>

    <!-- Filters -->
    <v-card class="filters-card mb-6">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="filters.centerId"
              :items="centerOptions"
              item-title="title"
              item-value="value"
              :label="$t('statistics.filters.center')"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="loadDashboard"
            ></v-select>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.fromMonth"
              :label="$t('statistics.filters.fromMonth')"
              type="month"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="loadDashboard"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="filters.toMonth"
              :label="$t('statistics.filters.toMonth')"
              type="month"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="loadDashboard"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboard">
          <!-- Summary Cards -->
          <v-row class="mb-6">
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="purple" class="mb-2">mdi-account</v-icon>
                  <div class="text-h5 font-weight-bold">{{ dashboard.students.totalCount }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.students') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="orange" class="mb-2">mdi-account-group</v-icon>
                  <div class="text-h5 font-weight-bold">{{ dashboard.students.activeCount }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.active') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="info" class="mb-2">mdi-email</v-icon>
                  <div class="text-h5 font-weight-bold">{{ dashboard.students.addedCount }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.added') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="red" class="mb-2">mdi-star</v-icon>
                  <div class="text-h5 font-weight-bold">{{ dashboard.students.stoppedCount }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.stopped') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="success" class="mb-2">mdi-leaf</v-icon>
                  <div class="text-h5 font-weight-bold">{{ formatCurrencyShort(dashboard.payroll.amountPaid) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.payroll') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" sm="6" md="4" lg="2">
              <v-card class="stat-card" elevation="0" border>
                <v-card-text class="text-center pa-4">
                  <v-icon size="40" color="info" class="mb-2">mdi-chart-line</v-icon>
                  <div class="text-h5 font-weight-bold">{{ dashboard.expenses.totalCount }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('statistics.cards.reports') }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Charts Row 1 -->
          <v-row class="mb-6">
            <!-- Revenue Updates Chart -->
            <v-col cols="12" lg="8">
              <v-card class="chart-card" elevation="0" border>
                <v-card-title class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-h6 font-weight-bold">{{ $t('statistics.charts.revenueTitle') }}</div>
                    <div class="text-caption text-medium-emphasis">{{ $t('statistics.charts.revenueSubtitle') }}</div>
                  </div>
                  <v-select
                    v-model="selectedPeriod"
                    :items="periodOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 150px"
                  ></v-select>
                </v-card-title>
                <v-card-text>
                  <apexchart
                    type="bar"
                    height="350"
                    :options="revenueChartOptions"
                    :series="revenueChartSeries"
                  ></apexchart>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Yearly Breakup -->
            <v-col cols="12" lg="4">
              <v-card class="chart-card" elevation="0" border>
                <v-card-title>
                  <div class="text-h6 font-weight-bold">{{ $t('statistics.charts.cashflowTitle') }}</div>
                </v-card-title>
                <v-card-text>
                  <div class="text-center mb-4">
                    <div class="text-h3 font-weight-bold" :class="dashboard.netCashflow >= 0 ? 'text-success' : 'text-error'">
                      {{ formatCurrencyShort(dashboard.netCashflow) }}
                    </div>
                    <div class="text-caption text-medium-emphasis mt-2">
                      {{ getPeriodLabel() }}
                    </div>
                  </div>
                  <apexchart
                    type="donut"
                    height="250"
                    :options="cashflowChartOptions"
                    :series="cashflowChartSeries"
                  ></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Charts Row 2 -->
          <v-row class="mb-6">
            <!-- Monthly Earnings -->
            <v-col cols="12" lg="6">
              <v-card class="chart-card" elevation="0" border>
                <v-card-title>
                  <div class="text-h6 font-weight-bold">{{ $t('statistics.charts.paymentsTitle') }}</div>
                </v-card-title>
                <v-card-text>
                  <div class="mb-4">
                    <div class="text-h4 font-weight-bold">{{ formatCurrencyShort(dashboard.payments.amountPaid) }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ $t('statistics.details.paidWithAmount', { amount: formatCurrency(dashboard.payments.amountPaid) }) }}
                    </div>
                  </div>
                  <apexchart
                    type="area"
                    height="250"
                    :options="paymentsChartOptions"
                    :series="paymentsChartSeries"
                  ></apexchart>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Students Chart -->
            <v-col cols="12" lg="6">
              <v-card class="chart-card" elevation="0" border>
                <v-card-title>
                  <div class="text-h6 font-weight-bold">{{ $t('statistics.charts.studentsTitle') }}</div>
                </v-card-title>
                <v-card-text>
                  <apexchart
                    type="line"
                    height="300"
                    :options="studentsChartOptions"
                    :series="studentsChartSeries"
                  ></apexchart>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Detailed Stats Cards -->
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="detail-card" elevation="0" border>
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ $t('statistics.details.payments') }}</v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.totalDebt') }}</span>
                      <span class="text-h6 font-weight-bold">{{ formatCurrency(dashboard.payments.amountDue) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payments.amountPaid, dashboard.payments.amountDue)"
                      color="success"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.paid') }}</span>
                      <span class="text-h6 text-success font-weight-bold">{{ formatCurrency(dashboard.payments.amountPaid) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payments.amountPaid, dashboard.payments.amountDue)"
                      color="success"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                  <div>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.remaining') }}</span>
                      <span class="text-h6 text-error font-weight-bold">{{ formatCurrency(dashboard.payments.remainingAmount) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payments.remainingAmount, dashboard.payments.amountDue)"
                      color="error"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="detail-card" elevation="0" border>
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ $t('statistics.details.expenses') }}</v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.totalAmount') }}</span>
                      <span class="text-h6 text-error font-weight-bold">{{ formatCurrency(dashboard.expenses.totalAmount) }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.totalCount') }}</span>
                      <span class="text-h6 font-weight-bold">{{ dashboard.expenses.totalCount }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card class="detail-card" elevation="0" border>
                <v-card-title class="text-subtitle-1 font-weight-bold">{{ $t('statistics.details.payroll') }}</v-card-title>
                <v-card-text>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.totalDebt') }}</span>
                      <span class="text-h6 font-weight-bold">{{ formatCurrency(dashboard.payroll.amountDue) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payroll.amountPaid, dashboard.payroll.amountDue)"
                      color="success"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                  <div class="mb-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.paid') }}</span>
                      <span class="text-h6 text-success font-weight-bold">{{ formatCurrency(dashboard.payroll.amountPaid) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payroll.amountPaid, dashboard.payroll.amountDue)"
                      color="success"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                  <div>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption text-medium-emphasis">{{ $t('statistics.details.remaining') }}</span>
                      <span class="text-h6 text-error font-weight-bold">{{ formatCurrency(dashboard.payroll.remainingAmount) }}</span>
                    </div>
                    <v-progress-linear
                      :model-value="getPercentage(dashboard.payroll.remainingAmount, dashboard.payroll.amountDue)"
                      color="error"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <v-icon size="64" color="grey">mdi-chart-line</v-icon>
      <div class="text-h6 mt-4 text-medium-emphasis">{{ $t('statistics.noData') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchDashboard } from '@/services/pages/statistics'
import type { DashboardResponse, DashboardParams } from '@/types/statistics.types'
import { fetchAllCenters } from '@/services/pages/centers'
import type { Center } from '@/types/centers.types'
import dayjs from 'dayjs'

const { t } = useI18n()

const loading = ref(false)
const dashboard = ref<DashboardResponse | null>(null)
const centers = ref<Center[]>([])
const selectedPeriod = ref('month')

const filters = ref<DashboardParams>({
  centerId: undefined,
  fromMonth: dayjs().format('YYYY-MM'),
  toMonth: dayjs().add(1, 'month').format('YYYY-MM'),
})

const periodOptions = computed(() => [
  { title: t('statistics.periods.month'), value: 'month' },
  { title: t('statistics.periods.year'), value: 'year' },
])

const centerOptions = computed(() => {
  return centers.value.map(center => ({
    title: center.name,
    value: center.id,
  }))
})

// Generate month labels for charts
const getMonthLabels = () => {
  const labels = []
  const start = dayjs(filters.value.fromMonth)
  const end = dayjs(filters.value.toMonth)
  let current = start
  
  while (current.isBefore(end) || current.isSame(end, 'month')) {
    labels.push(current.format('MMM YYYY'))
    current = current.add(1, 'month')
  }
  
  return labels
}

// Chart options and series
const revenueChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  colors: ['#56CA00', '#FF4C51'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent'],
  },
  xaxis: {
    categories: getMonthLabels(),
    labels: {
      style: {
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatCurrencyShort(val),
    },
  },
  fill: {
    opacity: 1,
  },
  legend: {
    position: 'top',
    horizontalAlign: 'right',
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val),
    },
  },
}))

const revenueChartSeries = computed(() => {
  if (!dashboard.value) return []
  
  // Mock data for multiple months - in real app, this would come from backend
  const months = getMonthLabels()
  const paidData = months.map(() => dashboard.value!.payments.amountPaid / months.length)
  const expenseData = months.map(() => dashboard.value!.expenses.totalAmount / months.length)
  
  return [
    {
      name: t('statistics.charts.income'),
      data: paidData,
    },
    {
      name: t('statistics.charts.expense'),
      data: expenseData,
    },
  ]
})

const cashflowChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'inherit',
  },
  colors: ['#56CA00', '#FF4C51'],
  labels: [t('statistics.charts.income'), t('statistics.charts.expense')],
  legend: {
    position: 'bottom',
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => `${val.toFixed(1)}%`,
  },
}))

const cashflowChartSeries = computed(() => {
  if (!dashboard.value) return []
  const total = dashboard.value.payments.amountPaid + dashboard.value.expenses.totalAmount
  if (total === 0) return [0, 0]
  return [
    (dashboard.value.payments.amountPaid / total) * 100,
    (dashboard.value.expenses.totalAmount / total) * 100,
  ]
})

const paymentsChartOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  colors: ['#01c0c8'],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  xaxis: {
    categories: getMonthLabels(),
  },
  yaxis: {
    labels: {
      formatter: (val: number) => formatCurrencyShort(val),
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
    },
  },
  tooltip: {
    y: {
      formatter: (val: number) => formatCurrency(val),
    },
  },
}))

const paymentsChartSeries = computed(() => {
  if (!dashboard.value) return []
  const months = getMonthLabels()
  const data = months.map(() => dashboard.value!.payments.amountPaid / months.length)
  return [
    {
      name: t('statistics.charts.payments'),
      data: data,
    },
  ]
})

const studentsChartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false },
    fontFamily: 'inherit',
  },
  colors: ['#01c0c8', '#16B1FF', '#FF4C51'],
  stroke: {
    curve: 'smooth',
    width: 3,
  },
  markers: {
    size: 5,
  },
  xaxis: {
    categories: getMonthLabels(),
  },
  yaxis: {
    labels: {
      formatter: (val: number) => Math.round(val).toString(),
    },
  },
  legend: {
    position: 'top',
  },
  tooltip: {
    shared: true,
  },
}))

const studentsChartSeries = computed(() => {
  if (!dashboard.value) return []
  const months = getMonthLabels()
  const totalPerMonth = dashboard.value.students.totalCount / months.length
  const activePerMonth = dashboard.value.students.activeCount / months.length
  const addedPerMonth = dashboard.value.students.addedCount / months.length
  
  return [
    {
      name: t('statistics.charts.total'),
      data: months.map(() => totalPerMonth),
    },
    {
      name: t('statistics.charts.active'),
      data: months.map(() => activePerMonth),
    },
    {
      name: t('statistics.charts.added'),
      data: months.map(() => addedPerMonth),
    },
  ]
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount) + ' so\'m'
}

const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000) {
    return (amount / 1000000).toFixed(1) + 'M'
  }
  if (amount >= 1000) {
    return (amount / 1000).toFixed(1) + 'k'
  }
  return amount.toString()
}

const getPercentage = (value: number, total: number): number => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const getPeriodLabel = () => {
  const start = dayjs(filters.value.fromMonth).format('MMM YYYY')
  const end = dayjs(filters.value.toMonth).format('MMM YYYY')
  return `${start} - ${end}`
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
.statistics-page {
  min-height: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(46, 38, 61, 0.9);
  line-height: 1.3;
}

.page-subtitle {
  font-size: 0.9375rem;
  color: rgba(46, 38, 61, 0.68);
  margin: 4px 0 0;
}

.filters-card {
  background: #fff;
}

.stat-card {
  transition:
    transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px 0 rgba(46, 38, 61, 0.14) !important;
}

.chart-card,
.detail-card {
  height: 100%;
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
