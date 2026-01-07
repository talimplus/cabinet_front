import http from '../baseHttp'
import type { PaymentsParams, PaymentsResponse } from '@/types/payments.types'

export const fetchPayments = async (params?: PaymentsParams): Promise<PaymentsResponse> => {
  const queryParams: any = {
    page: params?.page || 1,
    perPage: params?.perPage || 10,
  }

  if (params?.status && params.status !== 'all') {
    queryParams.status = params.status
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

