import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMe } from '@/services/pages/auth'

/**
 * Har bir sahifaga `meta.permission` qo'yilgan — u backenddagi
 * `@RequirePermissions(...)` bilan bir xil kalit. Bir nechta kalit berilsa,
 * bittasi yetarli (OR). `meta.permission` yo'q sahifa hammaga ochiq.
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/default.vue'),
      children: [
        {
          path: '/users',
          name: 'users',
          component: () => import('../views/users.vue'),
          meta: { permission: ['users.view'] },
        },
        {
          path: '/roles',
          name: 'roles',
          component: () => import('../views/roles.vue'),
          meta: { permission: ['roles.view'] },
        },
        {
          path: '/subjects',
          name: 'subjects',
          component: () => import('../views/subjects.vue'),
          meta: { permission: ['subjects.view'] },
        },
        {
          path: '/syllabuses',
          name: 'syllabuses',
          component: () => import('../views/syllabuses/index.vue'),
          meta: { permission: ['syllabus.view'] },
        },
        {
          path: '/syllabuses/:id',
          name: 'syllabus-view',
          component: () => import('../views/syllabuses/view.vue'),
          meta: { permission: ['syllabus.view'] },
        },
        {
          path: '/today',
          name: 'today-lessons',
          component: () => import('../views/teacher/today.vue'),
          meta: { permission: ['teacher.today'] },
        },
        {
          path: '/groups',
          name: 'groups',
          component: () => import('../views/groups/index.vue'),
          meta: { permission: ['groups.view'] },
        },
        {
          path: '/users/:id',
          name: 'staff-view',
          component: () => import('../views/staff/view.vue'),
          meta: { permission: ['staffPerformance.view'] },
        },
        {
          path: '/my-performance',
          name: 'my-performance',
          component: () => import('../views/staff/my.vue'),
          meta: { permission: ['staffAttendance.viewOwn'] },
        },
        {
          path: '/staff-attendance',
          name: 'staff-attendance',
          component: () => import('../views/staff-attendance/index.vue'),
          meta: { permission: ['staffAttendance.view'] },
        },
        {
          path: '/groups/:id',
          name: 'group-view',
          component: () => import('../views/groups/view.vue'),
          meta: { permission: ['groups.view'] },
        },
        {
          path: '/centers',
          name: 'centers',
          component: () => import('../views/centers.vue'),
          meta: { permission: ['centers.view'] },
        },
        {
          path: '/rooms',
          name: 'rooms',
          component: () => import('../views/rooms/index.vue'),
          meta: { permission: ['rooms.view'] },
        },
        {
          path: '/reception',
          name: 'reception',
          component: () => import('../views/students/reception.vue'),
          meta: { permission: ['students.view'] },
        },
        {
          path: '/leads',
          name: 'leads',
          component: () => import('../views/leads.vue'),
          meta: { permission: ['leads.view'] },
        },
        {
          path: '/students',
          name: 'students',
          component: () => import('../views/students/students.vue'),
          meta: { permission: ['students.view'] },
        },
        {
          path: '/students/:id',
          name: 'student-view',
          // O'quvchi kartasi to'liq to'lov ma'lumotidan quriladi — `payments.view` shart
          component: () => import('../views/students/view.vue'),
          meta: { permission: ['payments.view'] },
        },
        {
          path: '/stopped',
          name: 'stopped',
          component: () => import('../views/students/stopped.vue'),
          meta: { permission: ['students.view'] },
        },
        {
          path: '/ignored',
          name: 'ignored',
          component: () => import('../views/students/ignored.vue'),
          meta: { permission: ['students.view'] },
        },
        {
          path: '/finished',
          name: 'finished',
          component: () => import('../views/students/finished.vue'),
          meta: { permission: ['students.view'] },
        },
        {
          path: '/payments',
          name: 'payments',
          component: () => import('../views/payments.vue'),
          meta: { permission: ['payments.view'] },
        },
        {
          path: '/payroll',
          name: 'payroll',
          component: () => import('../views/payroll.vue'),
          meta: { permission: ['payroll.view'] },
        },
        {
          path: '/expenses',
          name: 'expenses',
          component: () => import('../views/expenses.vue'),
          meta: { permission: ['expenses.view'] },
        },
        {
          path: '/statistics',
          name: 'statistics',
          component: () => import('../views/statistics.vue'),
          meta: { permission: ['statistics.view'] },
        },
        {
          path: '/pending-receipts',
          name: 'pending-receipts',
          component: () => import('../views/pending-receipts.vue'),
          meta: { permission: ['receipts.view'] },
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('../views/profile.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/register.vue'),
    },
  ],
})

/**
 * Login qilgandan keyin (yoki ruxsatsiz sahifadan qaytarilganda) qaysi
 * sahifaga tushish. Rol nomiga emas, mavjud ruxsatlarga qarab tanlaymiz —
 * shuning uchun admin yaratgan istalgan yangi rol ham to'g'ri joyga tushadi.
 */
const HOME_CANDIDATES: { path: string; permission: string }[] = [
  { path: '/statistics', permission: 'statistics.view' },
  { path: '/today', permission: 'teacher.today' },
  { path: '/groups', permission: 'groups.view' },
  { path: '/students', permission: 'students.view' },
  { path: '/leads', permission: 'leads.view' },
  { path: '/payments', permission: 'payments.view' },
  { path: '/syllabuses', permission: 'syllabus.view' },
]

const resolveHome = (can: (...keys: string[]) => boolean): string => {
  const match = HOME_CANDIDATES.find((candidate) => can(candidate.permission))
  return match?.path ?? '/profile'
}

router.beforeEach(async (to) => {
  const token = localStorage.getItem('token')
  const isAuthPage = to.path === '/login' || to.path === '/register'

  if (!token) {
    return isAuthPage ? true : '/login'
  }

  const userStore = useUserStore()

  // Foydalanuvchi (va uning ruxsatlari) hali yuklanmagan bo'lsa — yuklaymiz
  if (!userStore.user) {
    try {
      const response = await getMe()
      if (response?.user) {
        userStore.setUser(response.user)
      }
    } catch {
      localStorage.removeItem('token')
      return '/login'
    }
  }

  // Login sahifasi va ildiz ('/') — ruxsatlarga mos birinchi sahifaga
  if (isAuthPage || to.path === '/') {
    return resolveHome(userStore.can)
  }

  const required = to.meta?.permission as string[] | undefined
  if (required?.length && !userStore.can(...required)) {
    return resolveHome(userStore.can)
  }

  return true
})

export default router
