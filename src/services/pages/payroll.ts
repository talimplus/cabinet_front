import http from '../baseHttp'
import type { StaffSalary, PayStaffSalaryPayload } from '@/types/payroll.types'

export const fetchStaffSalaries = async (forMonth?: string): Promise<StaffSalary[]> => {
  const params: any = {}
  if (forMonth) {
    params.forMonth = forMonth
  }
  const response = await http.get('/staff-salaries', { params })
  return response.data
}

export const payStaffSalary = async (id: number, payload: PayStaffSalaryPayload) => {
  return await http.put(`/staff-salaries/pay/${id}`, payload)
}
