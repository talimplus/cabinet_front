import http from '../baseHttp'
import type { LeadForm, LeadsParams } from '@/types/leads.types'
import type { LeadStatus } from '@/types/leads.enum'

export const fetchLeads = async (params?: LeadsParams) => {
  return await http.get('/leads', { params })
}

export const createLead = async (form: LeadForm) => {
  return await http.post('/leads', form)
}

export const updateLead = async (id: number, form: LeadForm) => {
  return await http.put(`/leads/${id}`, form)
}

export const deleteLead = async (id: number) => {
  return await http.delete(`/leads/${id}`)
}

export const changeLeadStatus = async (id: number, status: LeadStatus, reason?: string) => {
  return await http.put(`/leads/change-status/${id}`, {
    status,
    ...(reason ? { reason } : {}),
  })
}

export const transferLeadToStudent = async (id: number, form: LeadForm) => {
  return await http.post(`/leads/${id}/transfer-to-student`, form)
}
