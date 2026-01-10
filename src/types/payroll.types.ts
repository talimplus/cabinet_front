export enum PayrollStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
}

export interface StaffUser {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  role: string
  salary: number
  commissionPercentage: number | null
  createdAt: string
}

export interface StaffSalary {
  id: number
  userId: number
  forMonth: string
  baseSalary: number
  paidAmount: number
  status: PayrollStatus
  paidAt: string | null
  comment: string | null
  createdAt: string
  user: StaffUser
  // These fields are only present for teachers
  earningForMonth?: string
  earningBaseSalarySnapshot?: number
  earningCommissionAmount?: number
  earningCarryOverCommission?: number
  earningTotalEarning?: number
}


export interface PayStaffSalaryPayload {
  amount: number
  comment?: string
}
