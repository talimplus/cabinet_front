import http from '../baseHttp'
import type {
  PaymentsParams,
  PaymentsResponse,
  PendingReceiptsResponse,
} from '@/types/payments.types'

export const fetchPayments = async (params?: PaymentsParams): Promise<PaymentsResponse> => {
  const queryParams: any = {}

  if (params?.forMonth) {
    queryParams.forMonth = params.forMonth
  }

  if (params?.page) {
    queryParams.page = params.page
  }

  if (params?.perPage) {
    queryParams.perPage = params.perPage
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

  if (params?.centerId) {
    queryParams.centerId = params.centerId
  }

  const response = await http.get('/payments', { params: queryParams })
  return response.data
}

export const markAsPaid = async (id: number) => {
  return await http.put(`/payments/mark-as-paid/${id}`)
}

export const payPartial = async (id: number, amount: number) => {
  return await http.put(`/payments/pay-partial/${id}`, undefined, {
    params: { amount },
  })
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

