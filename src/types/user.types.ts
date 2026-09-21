export interface CurrentUser {
  id: number
  email: string
  /** Rol turi (admin/teacher/...). Ruxsat tekshiruvi uchun `permissions` ishlatiladi. */
  role: string
  /** Dinamik rol id'si */
  roleId?: number | null
  /** Rol nomi (admin yaratgan nom, masalan "Kassir") */
  roleName?: string | null
  centerId: number
  /** `<modul>.<amal>` kalitlari. `['*']` — barcha ruxsatlar (admin). */
  permissions?: string[]
}

export interface LoginResponse {
  access_token: string
  user: CurrentUser
}

export interface MeResponse {
  user: CurrentUser
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  password: string
  role: string
  /** Admin qo'ygan rol nomi ("Kassir"). Eski yozuvlarda bo'lmasligi mumkin. */
  roleName?: string | null
  centerId: number
  salary?: number
  commissionPercentage?: number
}

export interface UpdateProfileForm {
  firstName: string
  lastName: string
  login: string
  phone: string
  password?: string
}
