import http from '@/services/baseHttp'
import type { RegisterForm, LoginForm } from '@/types/auth.types'

export const register = async (form: RegisterForm) => {
        return http.post('/auth/register', form)
}


export const login = async (form: LoginForm) => {
        return http.post('/auth/login', form)
}