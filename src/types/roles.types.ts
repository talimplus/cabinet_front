/** Backenddagi `common/permissions/permission.catalog.ts` bilan bir xil shakl. */
export interface PermissionLabel {
  uz: string
  ru: string
}

export interface PermissionDef {
  /** `<modul>.<amal>` — masalan `students.create` */
  key: string
  label: PermissionLabel
}

export interface PermissionGroup {
  key: string
  label: PermissionLabel
  permissions: PermissionDef[]
}

/** Rol turi — ruxsatlarga ta'sir qilmaydi, biznes-mantiq uchun (masalan teacher). */
export type BaseRole = 'admin' | 'super_admin' | 'teacher' | 'manager' | 'reception' | 'other'

export interface Role {
  id: number
  /** Organization ichida unikal slug */
  key: string
  name: string
  baseRole: BaseRole
  permissions: string[]
  /** Seed qilingan rol — o'chirib bo'lmaydi (lekin ruxsatlari tahrirlanadi) */
  isSystem: boolean
  /** Administrator roli — na tahrirlash, na o'chirish mumkin */
  isLocked: boolean
  userCount: number
  createdAt?: string
  updatedAt?: string
}

export interface RoleForm {
  name: string
  baseRole: BaseRole
  permissions: string[]
}

/** Yangi rol yaratishda tanlash mumkin bo'lgan turlar (admin — mumkin emas). */
export const ASSIGNABLE_BASE_ROLES: BaseRole[] = ['manager', 'reception', 'teacher', 'other']
