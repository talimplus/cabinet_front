import http from '../baseHttp'
import type { UserForm, UsersParams, TeachersParams, TeacherListItem } from '@/types/users.types'
import type { UserProfile, UpdateProfileForm } from '@/types/user.types'

export const fetchUsers = async (par: UsersParams) => {
        return await http.get('/users/employees', { params: par })
}

// GET /users/teachers — paginatsiyasiz o'qituvchilar ro'yxati (massiv qaytaradi).
// Admin bo'lmagan foydalanuvchi backendda avtomatik o'z centerId siga cheklanadi.
export const fetchAllTeachers = async (params?: TeachersParams): Promise<TeacherListItem[]> => {
        const { data } = await http.get('/users/teachers', { params })
        return Array.isArray(data) ? data : (data?.data ?? [])
}

export const createUser = async (form: UserForm) => {
        return await http.post('/users', form)
}

export const updateUser = async (form: UserForm, id: number) => {
        return await http.put(`/users/${id}`, form)
}


export const deleteUser = async (id: number) => {
        return await http.delete(`/users/${id}`)
}

export const getUserMe = async (): Promise<UserProfile> => {
  const response = await http.get('/users/me')
  return response.data
}

export const updateUserMe = async (form: UpdateProfileForm) => {
  return await http.put('/users/me', form)
}