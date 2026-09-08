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
  // Shu oyda chegirilgan sababli (excused) darslar soni
  lessonsExcused?: number
  // To'langan oyga sababli qo'shilsa, ortiqcha summa shu yerga qaytariladi (refund)
  refundedAmount?: number
  // Bitta dars narxi (proratsiya/chiqarib tashlash hisoblari uchun)
  perLessonAmount?: number
  // Proratsiyasiz to'liq oylik summa
  fullAmount?: number
  // Qo'lda chiqarib tashlangan summa va sababi
  manualExcludedAmount?: number
  manualExcludedReason?: string | null
  isProrated?: boolean
  createdAt: string
  hasPendingReceipt?: boolean
  pendingReceiptsCount?: number
  pendingAmount?: number
}

// PUT /payments/preview-exclusion/{paymentId} va apply-exclusion body
export interface ExclusionPayload {
  excludeLessons?: number
  excludeAmount?: number
  comment?: string
}

// PUT /payments/preview-exclusion/{paymentId} javobi (saqlamaydi — jonli ko'rsatish)
export interface ExclusionPreviewResponse {
  perLessonAmount: number
  baseAmountDue: number
  excludedAmount: number
  newAmountDue: number
  newRemaining: number
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
  // Chegirilgan sababli (excused) darslar soni
  lessonsExcused?: number
  discountPercent: number
  amountDue: number
  currentAmountDue: number
  difference: number
}

export interface UpdatePaymentPayload {
  plannedStudyUntilDate?: string
}

// To'lov usullari (backend enum bilan mos)
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online'

// Muvaffaqiyatli to'lov javobidagi chek (invoice) obyekti
export interface PaymentCheck {
  // Chekni istalgan vaqtda qayta olish uchun receipt id'si
  receiptId?: number
  checkNo: string // "1" | "1-A" | "1-A-B" — katta qilib ko'rsatiladi
  transactionNo?: string // "TRX-20260906-000123" — tranzaksiya raqami
  invoiceNo: number // bazaviy raqam
  installmentIndex?: number // shu oy ichidagi nechanchi to'lov
  status: 'pending' | 'confirmed' | 'rejected'
  // Backend bog'liq yozuvlarni (guruh, o'qituvchi, qabul qilgan xodim) null qaytarishi mumkin
  student: { fullName?: string | null; phone?: string | null } | null
  group: { name?: string | null } | null
  teacher: { fullName?: string | null } | null
  forMonth?: string | null // "2026-09"
  amount: number
  balanceBefore?: number | null
  balanceAfter?: number | null
  paymentMethod?: PaymentMethod | null
  paidAt?: string | null // karta sanasi (bo'lsa)
  receivedAt?: string | null
  createdAt?: string | null
  receivedBy: { fullName?: string | null } | null
  comment?: string | null
}

// mark-as-paid / pay-partial javobi — ichida `check` keladi
export interface PaymentActionResponse {
  check?: PaymentCheck
  [key: string]: unknown
}

// GET /payments/receipt/{receiptId}/check javobi
// (backend chekni to'g'ridan-to'g'ri yoki { check } ichida qaytarishi mumkin)
export interface ReceiptCheckResponse {
  check: PaymentCheck
}

// GET /payments/{paymentId}/receipts javobi — shu oy uchun qilingan barcha to'lovlar
// (to'lovlar tarixi). Har bir element chop etish uchun to'liq chek ma'lumotini saqlaydi.
export interface PaymentReceiptsResponse {
  data: PaymentCheck[]
}

// mark-as-paid / pay-partial so'rovlari uchun qo'shimcha maydonlar
export interface PaymentReceptionExtra {
  paymentMethod?: PaymentMethod
  paidAt?: string // faqat paymentMethod === 'card' bo'lganda (YYYY-MM-DD)
  comment?: string
}

// GET /payments/student/{studentId}/summary javobidagi o'quvchi ma'lumoti
export interface StudentSummaryInfo {
  id: number
  firstName: string
  lastName: string
  phone: string
  status: string
  monthlyFee: number
}

// Umumiy to'lov ko'rsatkichlari
export interface StudentSummaryTotals {
  totalDue: number
  totalPaid: number
  totalDebt: number
  totalPending: number
  // Hozir to'lash mumkin bo'lgan maksimal summa (jami qarz)
  payableNow: number
}

// Har bir oy bo'yicha to'lov qatori (eng yangi oydan eskisiga tartiblangan)
export interface StudentSummaryMonth {
  paymentId: number
  forMonth: string // 'YYYY-MM'
  groupName: string
  amountDue: number
  amountPaid: number
  pendingAmount: number
  remaining: number
  status: 'paid' | 'unpaid' | 'partial'
  // Proratsiya (oy o'rtasida qo'shilganda summa kam chiqishini tushuntirish uchun) —
  // backend qaytarса ko'rsatiladi, aks holda "—" bo'ladi.
  lessonsPlanned?: number // shu oyda rejalashtirilgan darslar soni
  lessonsBillable?: number // haqiqatda hisoblangan (to'lovga kiradigan) darslar soni
  lessonsExcused?: number // sababli (excused) chegirilgan darslar soni
  perLessonAmount?: number // bitta dars narxi
  fullAmount?: number // proratsiyasiz to'liq oylik summa (guruh to'lovi, chegirma bilan)
  isProrated?: boolean // backend aniq bayroq bersa
  // Qo'lda chiqarib tashlangan summa va sababi
  manualExcludedAmount?: number
  manualExcludedReason?: string | null
}

export interface StudentPaymentSummary {
  student: StudentSummaryInfo
  totals: StudentSummaryTotals
  months: StudentSummaryMonth[]
  // Qarzni to'lash javobida — har to'langan oyga bitta chek
  checks?: PaymentCheck[]
}

// PUT /payments/pay-debt/student/{studentId} body
export interface PayDebtPayload {
  amount?: number
  comment?: string
  paymentMethod?: PaymentMethod
  paidAt?: string // faqat paymentMethod === 'card' bo'lganda (YYYY-MM-DD)
}
