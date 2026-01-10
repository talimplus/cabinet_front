import http from '../baseHttp'
import type { UserForm, UsersParams } from '@/types/users.types'

export const fetchUsers = async (par: UsersParams) => {
        return await http.get('/users/employees', { params: par })
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