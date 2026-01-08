export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export interface Student {
  firstName: string
  lastName: string
}

export interface Group {
  name: string
}

export interface Payment {
  id: number
  student: Student
  group: Group | null
  amountDue: number
  amountPaid: number
  remainingAmount: number
  status: PaymentStatus
  forMonth: string
  dueDate: string
  hardDueDate: string
  isOverdue: boolean
  lessonsPlanned: number
  lessonsBillable: number
  createdAt: string
}

export interface PaymentsResponse {
  data: Payment[]
  meta?: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

export interface PaymentsParams {
  forMonth?: string
  page?: number
  perPage?: number
  status?: PaymentStatus | 'all'
  search?: string
  groupId?: number
}

