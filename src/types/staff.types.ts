import type { StaffAttendance } from '@/types/staffAttendance.types'

/** Jarima sababi turi (faqat guruhlash uchun) */
export type StaffDeductionType = 'late' | 'unsettled_payment' | 'other'

export type ReceiptStatus = 'pending' | 'confirmed' | 'rejected'

export interface StaffOverviewUser {
  id: number
  firstName: string
  lastName: string
  phone: string
  login: string
  role: string
  /** Dinamik rol nomi ("Kassir") — bo'lmasa `role` ko'rsatiladi */
  roleName: string | null
  centerId: number | null
  centerName: string | null
  salary: number
  commissionPercentage: number
  createdAt: string
}

export interface StaffOverviewSummary {
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
  /** Qabul qilgan, lekin admin tasdiqlamagan cheklar */
  unsettledCount: number
  unsettledAmount: number
  rejectedCount: number
  rejectedAmount: number
  /** Shu oy uchun yozilgan jarimalar */
  deductionThisMonth: number
  /** Hali ushlanmagan jarima — keyingi oyliklardan ushlanadi */
  deductionOutstanding: number
}

export interface StaffOverviewMonth {
  month: string
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
}

export interface StaffDeduction {
  id: number
  userId: number
  amount: number
  appliedAmount: number
  remainingAmount: number
  type: StaffDeductionType
  reason: string
  sourceForMonth: string | null
  settledAt: string | null
  createdAt: string
  createdBy: { id: number; firstName: string; lastName: string } | null
}

export interface UnsettledReceipt {
  id: number
  amount: number
  status: ReceiptStatus
  paymentMethod: string | null
  checkNo: string | null
  transactionNo: string | null
  receivedAt: string
  comment: string | null
  student: { id: number; firstName: string; lastName: string } | null
  group: { id: number; name: string } | null
  forMonth: string | null
}

export interface StaffOverviewSalary {
  id: number
  forMonth: string
  /** Hisoblangan oylik (jarimasiz) */
  baseSalary: number
  /** Shu oy ushlab qolingan jarima */
  deductionAmount: number
  /** Qo'lga tegadigan summa */
  netSalary: number
  paidAmount: number
  remaining: number
  status: string
  appliedDeductions: {
    id: number
    deductionId: number
    amount: number
    reason: string | null
    type: StaffDeductionType | null
    sourceForMonth: string | null
  }[]
}

export interface StaffOverview {
  user: StaffOverviewUser
  forMonth: string
  summary: StaffOverviewSummary
  months: StaffOverviewMonth[]
  lateRecords: StaffAttendance[]
  attendanceRecords: StaffAttendance[]
  unsettledReceipts: UnsettledReceipt[]
  deductions: StaffDeduction[]
  salary: StaffOverviewSalary | null
}

export interface CreateStaffDeductionForm {
  userId: number
  amount: number
  reason: string
  type?: StaffDeductionType
  /** YYYY-MM */
  forMonth?: string
}
