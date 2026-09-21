import http from '../baseHttp'
import type {
  CreateStaffDeductionForm,
  StaffDeduction,
  StaffOverview,
} from '@/types/staff.types'

/** Boshqa xodimning sahifasi — `staffPerformance.view` kerak */
export const fetchStaffOverview = async (userId: number, forMonth?: string) => {
  const { data } = await http.get<StaffOverview>(`/staff/${userId}/overview`, {
    params: forMonth ? { forMonth } : undefined,
  })
  return data
}

/** O'z sahifasi — har bir xodim ko'ra oladi */
export const fetchMyOverview = async (forMonth?: string) => {
  const { data } = await http.get<StaffOverview>('/staff/me/overview', {
    params: forMonth ? { forMonth } : undefined,
  })
  return data
}

export const fetchStaffDeductions = async (userId: number) => {
  const { data } = await http.get<StaffDeduction[]>(`/staff/${userId}/deductions`)
  return data
}

export const createStaffDeduction = async (form: CreateStaffDeductionForm) => {
  const { data } = await http.post<StaffDeduction>('/staff/deductions', form)
  return data
}

export const deleteStaffDeduction = async (id: number) => {
  return await http.delete(`/staff/deductions/${id}`)
}
