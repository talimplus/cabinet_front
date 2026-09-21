import http from '../baseHttp'
import type {
  OrganizationBranding,
  OrganizationBrandingForm,
} from '@/types/organization.types'

export const fetchOrganizationBranding = async () => {
  const { data } = await http.get<OrganizationBranding>('/organizations/branding')
  return data
}

export const updateOrganizationBranding = async (
  payload: OrganizationBrandingForm,
) => {
  const { data } = await http.put<OrganizationBranding>(
    '/organizations/branding',
    payload,
  )
  return data
}
