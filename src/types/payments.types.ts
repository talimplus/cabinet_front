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
  hasPendingReceipt?: boolean
  pendingReceiptsCount?: number
  pendingAmount?: number
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
  centerId?: number
}

export interface PendingReceiptPayment {
  id: number
  studentId: number
  groupId: number | null
  forMonth: string
  student: Student
  group: Group | null
}

export interface PendingReceipt {
  id: number
  paymentId: number
  amount: string
  receivedById: number
  receivedAt: string
  confirmedById: number | null
  confirmedAt: string | null
  status: 'pending' | 'confirmed'
  comment: string | null
  createdAt: string
  payment: PendingReceiptPayment
}

export interface PendingReceiptsResponse {
  data: PendingReceipt[]
  meta?: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}

export interface PaymentCalculationResponse {
  paymentId: number
  studentId: number
  studentName: string
  forMonth: string
  plannedStudyUntilDate: string
  lessonsPlanned: number
  lessonsBillable: number
  discountPercent: number
  amountDue: number
  currentAmountDue: number
  difference: number
}

export interface UpdatePaymentPayload {
  plannedStudyUntilDate?: string
}

