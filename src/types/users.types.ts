import type { Center } from '@/types/centers.types'
import type { Role } from '@/types/roles.types'

export interface User {
        id: number,
        firstName: string,
        lastName: string,
        fullName?: string,
        login: string,
        phone: string,
        password: string,
        /** Rol turi (teacher/manager/...). Ko'rsatish uchun `userRole.name` ishlatiladi. */
        role: string,
        /** Biriktirilgan dinamik rol */
        userRole?: Pick<Role, 'id' | 'name' | 'baseRole'> | null,
        center?: Center,
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
        /** Tanlangan rol id'si (backend ruxsatlarni shundan oladi) */
        roleId?: number,
        centerId?: number,
        salary?: number,
        commissionPercentage?: number
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
