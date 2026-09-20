import http from '../baseHttp'
import type {
  PaymentsParams,
  PaymentsResponse,
  PendingReceiptsResponse,
  StudentPaymentSummary,
  PayDebtPayload,
  PaymentReceptionExtra,
  PaymentActionResponse,
  ReceiptCheckResponse,
  PaymentCheck,
  PaymentReceiptsResponse,
  ExclusionPayload,
  ExclusionPreviewResponse,
} from '@/types/payments.types'

// Ro'yxat va Excel eksporti bir xil filterlarni ishlatadi — query shu yerda yig'iladi.
// Paginatsiya (page/perPage) faqat ro'yxat uchun, eksportda yo'q.
const buildPaymentsQuery = (params?: PaymentsParams): Record<string, unknown> => {
  const queryParams: Record<string, unknown> = {}

  if (params?.forMonth) {
    queryParams.forMonth = params.forMonth
  }

  if (params?.status && params.status !== 'all') {
    queryParams.status = params.status
  }

  if (params?.search) {
    queryParams.search = params.search
  }

  if (params?.groupId) {
    queryParams.groupId = params.groupId
  }

  if (params?.teacherId) {
    queryParams.teacherId = params.teacherId
  }

  if (params?.centerId) {
    queryParams.centerId = params.centerId
  }

  if (params?.dateFrom) {
    queryParams.dateFrom = params.dateFrom
  }

  if (params?.dateTo) {
    queryParams.dateTo = params.dateTo
  }

  return queryParams
}

export const fetchPayments = async (params?: PaymentsParams): Promise<PaymentsResponse> => {
  const queryParams = buildPaymentsQuery(params)

  if (params?.page) {
    queryParams.page = params.page
  }

  if (params?.perPage) {
    queryParams.perPage = params.perPage
  }

  const response = await http.get('/payments', { params: queryParams })
  return response.data
}

// Content-Disposition sarlavhasidan fayl nomini ajratib olamiz.
// Backend `filename="..."` yuboradi; RFC 5987 (`filename*=UTF-8''...`) ham qo'llab-quvvatlanadi.
const parseFilename = (disposition?: string): string | null => {
  if (!disposition) return null

  const utf8Match = /filename\*=\s*UTF-8''([^;]+)/i.exec(disposition)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim())
    } catch {
      return utf8Match[1].trim()
    }
  }

  const plainMatch = /filename\s*=\s*"?([^";]+)"?/i.exec(disposition)
  return plainMatch?.[1]?.trim() || null
}

// GET /payments/export — ro'yxatdagi filterlar bilan bir xil, paginatsiyasiz .xlsx fayl.
// Fayl nomi Content-Disposition'dan olinadi (backendda CORS exposedHeaders ochilgan).
export const exportPayments = async (
  params?: PaymentsParams,
): Promise<{ blob: Blob; filename: string }> => {
  const queryParams = buildPaymentsQuery(params)

  const response = await http.get('/payments/export', {
    params: queryParams,
    responseType: 'blob',
  })

  const fallback = `tolovlar_${new Date().toISOString().slice(0, 10)}.xlsx`
  const filename = parseFilename(response.headers?.['content-disposition']) || fallback

  return { blob: response.data as Blob, filename }
}

// To'liq to'lov. Body JSON: { paymentMethod?, paidAt?, comment? }
// Javobda muvaffaqiyatli to'lov cheki (`check`) qaytadi.
export const markAsPaid = async (
  id: number,
  extra?: PaymentReceptionExtra,
): Promise<PaymentActionResponse> => {
  const payload: Record<string, unknown> = {}
  if (extra?.paymentMethod) payload.paymentMethod = extra.paymentMethod
  if (extra?.paidAt) payload.paidAt = extra.paidAt
  if (extra?.comment) payload.comment = extra.comment
  const response = await http.put(`/payments/mark-as-paid/${id}`, payload)
  return response.data
}

// Qisman to'lov. Body JSON: { amount, paymentMethod?, paidAt?, comment? }
// Javobda muvaffaqiyatli to'lov cheki (`check`) qaytadi.
export const payPartial = async (
  id: number,
  amount: number,
  extra?: PaymentReceptionExtra,
): Promise<PaymentActionResponse> => {
  const payload: Record<string, unknown> = { amount }
  if (extra?.comment) payload.comment = extra.comment
  if (extra?.paymentMethod) payload.paymentMethod = extra.paymentMethod
  if (extra?.paidAt) payload.paidAt = extra.paidAt
  const response = await http.put(`/payments/pay-partial/${id}`, payload)
  return response.data
}

// Istalgan vaqtda chekni qayta olish: GET /payments/receipt/{receiptId}/check
// Backend chekni to'g'ridan-to'g'ri yoki { check: ... } ichida qaytarishi mumkin.
export const fetchReceiptCheck = async (receiptId: number | string): Promise<PaymentCheck> => {
  const response = await http.get(`/payments/receipt/${receiptId}/check`)
  const data = response.data as PaymentCheck | ReceiptCheckResponse
  return (data as ReceiptCheckResponse)?.check ?? (data as PaymentCheck)
}

// To'lovlar tarixi: GET /payments/{paymentId}/receipts
// Shu oy (payment) uchun qilingan barcha to'lovlar, har biri to'liq chek ma'lumoti bilan —
// shuning uchun chop etish uchun qo'shimcha so'rov kerak emas.
export const fetchPaymentReceipts = async (paymentId: number): Promise<PaymentCheck[]> => {
  const response = await http.get(`/payments/${paymentId}/receipts`)
  const data = response.data as PaymentCheck[] | PaymentReceiptsResponse
  return Array.isArray(data) ? data : (data?.data ?? [])
}

// Darslarni/summani chiqarib tashlashni oldindan hisoblash (saqlamaydi).
// Body JSON: { excludeLessons?, excludeAmount? }
export const previewExclusion = async (
  paymentId: number,
  payload: ExclusionPayload,
): Promise<ExclusionPreviewResponse> => {
  const response = await http.put(`/payments/preview-exclusion/${paymentId}`, payload)
  return response.data
}

// Chiqarib tashlashni saqlash (amountDue kamayadi). comment majburiy.
// Body JSON: { excludeLessons?, excludeAmount?, comment }
export const applyExclusion = async (paymentId: number, payload: ExclusionPayload) => {
  return await http.put(`/payments/apply-exclusion/${paymentId}`, payload)
}

export const fetchPendingReceipts = async (): Promise<PendingReceiptsResponse> => {
  const response = await http.get('/payments/pending-receipts')
  // Backend returns array directly, wrap it in response format
  if (Array.isArray(response.data)) {
    return {
      data: response.data,
    }
  }
  return response.data
}

export const confirmReceipt = async (id: number) => {
  return await http.put(`/payments/confirm-receipt/${id}`)
}

export const calculatePayment = async (id: number, plannedStudyUntilDate: string) => {
  const response = await http.put(`/payments/calculate/${id}`, { plannedStudyUntilDate })
  return response.data
}

export const updatePayment = async (id: number, payload: { plannedStudyUntilDate?: string }) => {
  return await http.put(`/payments/${id}`, payload)
}

// Bitta o'quvchining to'lovlar holati (karta + oylar jadvali + jami qarz)
export const fetchStudentPaymentSummary = async (
  studentId: number,
): Promise<StudentPaymentSummary> => {
  const response = await http.get(`/payments/student/${studentId}/summary`)
  return response.data
}

// Jami qarzni to'lash. Summa eng eski oydan boshlab backendda taqsimlanadi.
// So'rov body orqali JSON yuboriladi (query emas).
export const payStudentDebt = async (
  studentId: number,
  payload: PayDebtPayload = {},
): Promise<StudentPaymentSummary> => {
  const response = await http.put(`/payments/pay-debt/student/${studentId}`, payload)
  return response.data
}
