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
  /** Rol turi (teacher — foiz oladi). Ko'rsatish uchun `userRole.name`. */
  role: string
  /** Biriktirilgan dinamik rol */
  userRole?: { id: number; name: string; baseRole: string } | null
  salary: number
  commissionPercentage: number | null
  createdAt: string
}

export interface PaymentHistoryItem {
  id: number
  amount: number
  comment: string | null
  paidAt: string
  paidBy: {
    id: number
    firstName: string
    lastName: string
  }
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
  paymentHistory?: PaymentHistoryItem[]
  // These fields are only present for teachers
  earningForMonth?: string
  earningBaseSalarySnapshot?: number
  earningCommissionAmount?: number
  earningCarryOverCommission?: number
  earningTotalEarning?: number
  // Jarimalar (oylikdan ushlab qolish)
  /** Shu oy oyligidan ushlab qolingan jarima */
  deductionAmount?: number
  /** Qo'lga tegadigan summa: baseSalary − deductionAmount */
  netSalary?: number
  /** netSalary − paidAmount */
  remaining?: number
  /** Hali ushlanmagan jarima qoldig'i (keyingi oyliklarga o'tadi) */
  deductionOutstanding?: number
}


export interface PayStaffSalaryPayload {
  /** Qo'lga beriladigan summa. Faqat jarima yozish uchun 0 yuboriladi. */
  amount: number
  comment?: string
  /** Shu to'lov bilan birga yoziladigan jarima (oylikdan ushlab qolinadi) */
  deduction?: {
    amount: number
    reason: string
    type?: 'late' | 'unsettled_payment' | 'other'
  }
}
