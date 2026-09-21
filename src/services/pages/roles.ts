import http from '../baseHttp'
import type { PermissionGroup, Role, RoleForm } from '@/types/roles.types'

/** Ruxsatlar katalogi — rol formasidagi checkbox'lar shu ro'yxatdan chiziladi. */
export const fetchPermissionCatalog = async (): Promise<PermissionGroup[]> => {
  const { data } = await http.get('/roles/permissions')
  return Array.isArray(data) ? data : []
}

export const fetchRoles = async (): Promise<Role[]> => {
  const { data } = await http.get('/roles')
  return Array.isArray(data) ? data : []
}

export const createRole = async (form: RoleForm) => {
  return await http.post('/roles', form)
}

export const updateRole = async (id: number, form: Partial<RoleForm>) => {
  return await http.put(`/roles/${id}`, form)
}

export const deleteRole = async (id: number) => {
  return await http.delete(`/roles/${id}`)
}
