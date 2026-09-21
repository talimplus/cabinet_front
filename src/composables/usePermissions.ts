import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * Ruxsatlar uchun markaziy manba.
 *
 * Endi rollar **dinamik**: tekshiruv rol nomiga emas, backend bergan ruxsat
 * kalitlariga (`students.create`, `payments.view`, ...) qarab qilinadi.
 * Kalitlar `/auth/me` javobidagi `permissions` massividan keladi.
 *
 * Bu yerdagi flaglar faqat UI'ni yashiradi — asosiy himoya backendda
 * (`@RequirePermissions(...)` → 403).
 */
export function usePermissions() {
  const userStore = useUserStore()

  const role = computed(() => userStore.user?.role ?? '')
  const userId = computed(() => userStore.user?.id ?? null)

  /** Asosiy tekshiruv: `can('students.create')`. Bir nechta kalit — OR. */
  const can = (...keys: string[]) => userStore.can(...keys)

  return {
    role,
    userId,
    can,
    canAll: userStore.canAll,

    // ── Rol turi bo'yicha flaglar ───────────────────────────────────
    // Bular ruxsat emas, biznes-mantiq: o'qituvchi faqat o'z guruhini
    // ko'radi, qabulxona uchun alohida ko'rinish va h.k.
    isReception: computed(() => role.value === 'reception'),
    isTeacher: computed(() => role.value === 'teacher'),
    isManagerLevel: computed(() => userStore.can('users.view', 'statistics.view')),

    // ── Ma'lumot ko'rish (filtr select'lari, formadagi ro'yxatlar) ──
    // Bu flaglar bilan MA'LUMOT KELADIGAN blok yashiriladi va so'rov ham
    // yuborilmaydi — aks holda ruxsatsiz endpointdan 403 qaytardi.
    canViewCenters: computed(() => userStore.can('centers.view')),
    canViewSubjects: computed(() => userStore.can('subjects.view')),
    canViewRooms: computed(() => userStore.can('rooms.view')),
    canViewGroups: computed(() => userStore.can('groups.view')),
    canViewStudents: computed(() => userStore.can('students.view')),
    canViewLeads: computed(() => userStore.can('leads.view')),
    canViewSyllabuses: computed(() => userStore.can('syllabus.view')),
    canViewGroupPlan: computed(() => userStore.can('groupPlan.view')),
    canViewReceipts: computed(() => userStore.can('receipts.view')),
    canViewExpenses: computed(() => userStore.can('expenses.view')),
    canViewPayroll: computed(() => userStore.can('payroll.view')),
    canViewStatistics: computed(() => userStore.can('statistics.view')),
    canViewSchedule: computed(() => userStore.can('schedule.view')),
    canViewAttendance: computed(() => userStore.can('attendance.view')),
    canViewUsers: computed(() => userStore.can('users.view')),
    /** `GET /users/employees` — backendda uchta kalitdan bittasi yetarli */
    canViewEmployees: computed(() =>
      userStore.can('users.view', 'groups.create', 'groups.update'),
    ),
    /** `GET /users/teachers` — guruh/o'quvchi formalari uchun ham ochiq */
    canViewTeachers: computed(() =>
      userStore.can('users.view', 'groups.view', 'students.view'),
    ),

    // ── Kurs rejasi ────────────────────────────────────────────────
    canManageSyllabus: computed(() => userStore.can('syllabus.manage')),
    /** Guruh rejasidagi mavzularni boshqarish (o'qituvchi ham qila oladi) */
    canManageGroupSyllabus: computed(() => userStore.can('groupPlan.manage')),
    /** Guruhga kurs rejasini biriktirish/almashtirish/uzish — menejer darajasi */
    canAttachGroupSyllabus: computed(() => userStore.can('groupPlan.attach')),

    // ── Guruhlar ───────────────────────────────────────────────────
    canCreateGroup: computed(() => userStore.can('groups.create')),
    canEditGroup: computed(() => userStore.can('groups.update')),
    canDeleteGroup: computed(() => userStore.can('groups.delete')),
    // Guruh statusi alohida ruxsat — tahrirlash bilan bir xil emas
    canChangeGroupStatus: computed(() => userStore.can('groups.changeStatus')),

    // ── O'quvchilar ────────────────────────────────────────────────
    canCreateStudent: computed(() => userStore.can('students.create')),
    canEditStudent: computed(() => userStore.can('students.update')),
    canEditActiveStudent: computed(() => userStore.can('students.update')),
    canDeleteStudent: computed(() => userStore.can('students.delete')),
    canChangeStudentStatus: computed(() => userStore.can('students.changeStatus')),
    canManageDiscounts: computed(() => userStore.can('students.discounts')),

    // ── Lidlar ─────────────────────────────────────────────────────
    canCreateLead: computed(() => userStore.can('leads.create')),
    canEditLead: computed(() => userStore.can('leads.update')),
    canDeleteLead: computed(() => userStore.can('leads.delete')),
    canTransferLead: computed(() => userStore.can('leads.transfer')),

    // ── To'lovlar ──────────────────────────────────────────────────
    canAcceptPayment: computed(() => userStore.can('payments.create')),
    canEditPayment: computed(() => userStore.can('payments.update')),
    canExportPayments: computed(() => userStore.can('payments.export')),
    canRecalculatePayment: computed(() => userStore.can('payments.recalculate')),
    /** To'lovdan darslarni chiqarib tashlash — alohida ruxsat */
    canManageExclusion: computed(() => userStore.can('payments.exclusion')),
    canViewPayments: computed(() => userStore.can('payments.view')),

    // ── Cheklar ────────────────────────────────────────────────────
    canConfirmReceipt: computed(() => userStore.can('receipts.confirm')),
    canRejectReceipt: computed(() => userStore.can('receipts.reject')),

    // ── Oylik ──────────────────────────────────────────────────────
    canPaySalary: computed(() => userStore.can('payroll.pay')),
    canCalculateEarnings: computed(() => userStore.can('payroll.calculate')),

    // ── Xarajatlar ─────────────────────────────────────────────────
    canCreateExpense: computed(() => userStore.can('expenses.create')),
    canEditExpense: computed(() => userStore.can('expenses.update')),
    canDeleteExpense: computed(() => userStore.can('expenses.delete')),

    // ── Sozlamalar ─────────────────────────────────────────────────
    canManageCenters: computed(() => userStore.can('centers.manage')),
    canManageRooms: computed(() => userStore.can('rooms.manage')),
    canManageSubjects: computed(() => userStore.can('subjects.manage')),

    // ── Xodimlar ───────────────────────────────────────────────────
    canCreateUser: computed(() => userStore.can('users.create')),
    canEditUser: computed(() => userStore.can('users.update')),
    canDeleteUser: computed(() => userStore.can('users.delete')),
    canManageRoles: computed(() => userStore.can('roles.manage')),

    // ── AI ─────────────────────────────────────────────────────────
    canUseSyllabusAi: computed(() => userStore.can('syllabus.ai')),

    // ── Davomat ────────────────────────────────────────────────────
    canManageAttendance: computed(() => userStore.can('attendance.manage')),
    canManagePastAttendance: computed(() => userStore.can('attendance.managePast')),

    /**
     * Dars rejasini tahrirlash (mavzu biriktirish, AI taqsimlash).
     * `groupPlan.manage` ruxsati bor xodim har doim; o'qituvchi esa
     * ruxsati bo'lsa ham faqat O'ZINING guruhida.
     */
    canEditLessonPlan: (isOwnGroup: boolean) => {
      if (!userStore.can('groupPlan.manage')) return false
      return role.value === 'teacher' ? isOwnGroup : true
    },
  }
}
