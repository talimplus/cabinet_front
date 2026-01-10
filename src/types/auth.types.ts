export interface RegisterForm {
        firstName: string
        lastName?: string
        password?: string
        organizationName?: string
        centerName?: string
        phone?: string
        email?: string
}

export interface LoginForm {
        email: string
        password: string
}
