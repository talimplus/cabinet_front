import type { LeadStatus } from '@/types/leads.enum'

export interface Lead {
  id: number
  firstName?: string | null
  lastName?: string | null
  phone: string
  secondPhone?: string | null
  birthDate?: string | null
  monthlyFee?: number | null
  discountPercent?: number | null
  discountReason?: string | null
  comment?: string | null
  heardAboutUs?: string | null
  preferredTime?: 'morning' | 'evening' | string | null
  preferredDays?: string[] | null
  passportSeries?: string | null
  passportNumber?: string | null
  jshshir?: string | null
  status?: LeadStatus
  groupIds?: number[]
  centerId?: number
  followUpDate?: string | null
  createdAt?: string
  updatedAt?: string
  statusLoading?: boolean
}

export interface LeadForm {
  phone: string
  firstName?: string
  lastName?: string
  secondPhone?: string
  birthDate?: string
  monthlyFee?: number
  discountPercent?: number
  discountReason?: string
  comment?: string
  heardAboutUs?: string
  preferredTime?: 'morning' | 'evening' | string
  preferredDays?: string[]
  passportSeries?: string
  passportNumber?: string
  jshshir?: string
  status?: LeadStatus
  groupIds?: number[]
  centerId?: number
  followUpDate?: string
}

export interface LeadsParams {
  centerId?: number
  name?: string
  phone?: string
  status?: LeadStatus
  groupId?: number
  followUpDate?: string
  page?: number
  perPage?: number
}
