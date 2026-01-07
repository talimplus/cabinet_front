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
  status: PaymentStatus
  forMonth: string
  createdAt: string
}

export interface PaymentsResponse {
  data: Payment[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

export interface PaymentsParams {
  page?: number
  perPage?: number
  status?: PaymentStatus | 'all'
}

