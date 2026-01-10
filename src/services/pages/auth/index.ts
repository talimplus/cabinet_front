import http from '@/services/baseHttp'
import type { RegisterForm, LoginForm } from '@/types/auth.types'
import type { MeResponse, LoginResponse } from '@/types/user.types'

export const register = async (form: RegisterForm) => {
        return http.post('/auth/register', form)
}

export const login = async (form: LoginForm): Promise<{ data: LoginResponse }> => {
        return http.post('/auth/login', form)
}

export const logout = async () => {
        return http.post('/auth/logout')
}

export const getMe = async (): Promise<MeResponse> => {
        const response = await http.get('/auth/me')
        return response.data
}