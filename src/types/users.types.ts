import type { Center } from '@/types/centers.types'

export interface User {
        id: number,
        firstName: string,
        lastName: string,
        fullName?: string,
        login: string,
        phone: string,
        password: string,
        role: string,
        centerId: number,
        salary: number,
        commissionPercentage: number
}

export interface UserForm {
        firstName: string,
        lastName: string,
        login: string,
        phone: string,
        password: string,
        role: string,
        centerId: number,
        salary: number,
        commissionPercentage: number
}

export interface UsersParams {
        centerId?: number;
        name?: string;
        phone?: string;
        page?: number;
        perPage?: number
}

export interface TeachersParams {
        centerId?: number;
        name?: string
}

// GET /users/teachers — paginatsiyasiz o'qituvchilar ro'yxati (filter select'lari uchun)
export interface TeacherListItem {
        id: number,
        firstName: string,
        lastName: string,
        phone?: string,
        role?: string,
        center?: Center
}
