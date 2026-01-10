export interface Center {
  id: number
  name: string
}

export interface Expense {
  id: number
  centerId: number
  name: string
  amount: number
  description: string
  forMonth: string
  createdAt: string
  center?: Center
}

export interface ExpenseForm {
  centerId: number
  name: string
  amount: number
  description: string
  forMonth: string
}

export interface ExpensesParams {
  page?: number
  perPage?: number
  forMonth?: string
  centerId?: number
  search?: string
}

export interface ExpensesResponse {
  data: Expense[]
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}
