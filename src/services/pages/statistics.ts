import http from '../baseHttp'
import type { DashboardParams, DashboardResponse } from '@/types/statistics.types'

export const fetchDashboard = async (params?: DashboardParams): Promise<DashboardResponse> => {
  const response = await http.get('/statistics/dashboard', { params })
  return response.data
}
