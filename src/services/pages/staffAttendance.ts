import http from '../baseHttp'
import type {
  CheckInPayload,
  CheckInResult,
  ManualCheckInForm,
  StaffAttendance,
  StaffAttendanceParams,
  StaffAttendanceReport,
  StaffAttendanceToday,
} from '@/types/staffAttendance.types'

export const checkIn = async (payload: CheckInPayload) => {
  const { data } = await http.post<CheckInResult>('/staff-attendance/check-in', payload)
  return data
}

export const fetchMyAttendanceToday = async () => {
  const { data } = await http.get<StaffAttendanceToday>('/staff-attendance/me/today')
  return data
}

export const fetchMyAttendance = async (params: StaffAttendanceParams) => {
  return await http.get('/staff-attendance/me', { params })
}

export const fetchStaffAttendance = async (params: StaffAttendanceParams) => {
  return await http.get('/staff-attendance', { params })
}

export const fetchStaffAttendanceReport = async (params: {
  from: string
  to: string
  centerId?: number
}) => {
  const { data } = await http.get<StaffAttendanceReport>('/staff-attendance/report', {
    params,
  })
  return data
}

export const confirmStaffAttendance = async (id: number) => {
  const { data } = await http.post<StaffAttendance>(`/staff-attendance/${id}/confirm`)
  return data
}

export const createManualAttendance = async (form: ManualCheckInForm) => {
  const { data } = await http.post<StaffAttendance>('/staff-attendance/manual', form)
  return data
}

export const deleteStaffAttendance = async (id: number) => {
  return await http.delete(`/staff-attendance/${id}`)
}
