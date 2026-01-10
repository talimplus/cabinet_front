import http from '../baseHttp'
import type { ExpenseForm, ExpensesParams, ExpensesResponse, Expense } from '@/types/expenses.types'

export const fetchExpenses = async (params?: ExpensesParams): Promise<ExpensesResponse> => {
  const response = await http.get('/expenses', { params })
  return response.data
}

export const fetchExpenseById = async (id: number): Promise<Expense> => {
  const response = await http.get(`/expenses/${id}`)
  return response.data
}

export const createExpense = async (form: ExpenseForm) => {
  return await http.post('/expenses', form)
}

export const updateExpense = async (id: number, form: ExpenseForm) => {
  return await http.put(`/expenses/${id}`, form)
}

export const deleteExpense = async (id: number) => {
  return await http.delete(`/expenses/${id}`)
}
