import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * Rol asosidagi ruxsatlar uchun markaziy manba.
 * Backenddagi role-guard'lar bilan mos: bu yerdagi flaglar UI'ni yashiradi,
 * asosiy himoya baribir backendda (403) qoladi.
 */
export function usePermissions() {
  const userStore = useUserStore()
  const role = computed(() => userStore.user?.role ?? '')
  const userId = computed(() => userStore.user?.id ?? null)

  const has = (...roles: string[]) => roles.includes(role.value)

  return {
    role,
    userId,
    isReception: computed(() => role.value === 'reception'),
    isTeacher: computed(() => role.value === 'teacher'),
    isManagerLevel: computed(() => has('super_admin', 'admin', 'manager')),

    // Kurs rejasi (syllabus) va uning mavzularini boshqarish: super_admin, admin, manager
    canManageSyllabus: computed(() => has('super_admin', 'admin', 'manager')),
    // Guruhga kurs rejasini biriktirish/uzish/almashtirish: super_admin, admin, manager
    canManageGroupSyllabus: computed(() => has('super_admin', 'admin', 'manager')),

    // Guruhlar
    canCreateGroup: computed(() => has('super_admin', 'admin', 'manager')),
    canEditGroup: computed(() => has('super_admin', 'admin', 'manager')),
    canDeleteGroup: computed(() => has('super_admin', 'admin')),

    // O'quvchilar: tahrirlash/status/chegirma — reception va teacher qila olmaydi
    canEditStudent: computed(() => has('super_admin', 'admin', 'manager')),

    // Davomat: reception qila olmaydi
    canManageAttendance: computed(() => has('super_admin', 'admin', 'manager', 'teacher')),

    /**
     * Dars rejasini tahrirlash (mavzu biriktirish, AI taqsimlash).
     * super_admin/admin/manager har doim; teacher faqat O'ZINING guruhida.
     */
    canEditLessonPlan: (isOwnGroup: boolean) =>
      has('super_admin', 'admin', 'manager') || (role.value === 'teacher' && isOwnGroup),
  }
}
