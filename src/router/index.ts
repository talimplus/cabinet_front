import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMe } from '@/services/pages/auth'

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
          component: () => import('../views/users.vue')
        },
        {
          path: '/subjects',
          name: 'subjects',
          component: () => import('../views/subjects.vue')
        },
        {
          path: '/syllabuses',
          name: 'syllabuses',
          component: () => import('../views/syllabuses/index.vue')
        },
        {
          path: '/syllabuses/:id',
          name: 'syllabus-view',
          component: () => import('../views/syllabuses/view.vue')
        },
        {
          path: '/today',
          name: 'today-lessons',
          component: () => import('../views/teacher/today.vue')
        },
        {
          path: '/groups',
          name: 'groups',
          component: () => import('../views/groups/index.vue'),
        },
        {
          path: '/groups/:id',
          name: 'group-view',
          component: () => import('../views/groups/view.vue'),
        },
        {
          path: '/centers',
          name: 'centers',
          component: () => import('../views/centers.vue')
        },
        {
          path: '/rooms',
          name: 'rooms',
          component: () => import('../views/rooms/index.vue')
        },
        {
          path: '/reception',
          name: 'reception',
          component: () => import('../views/students/reception.vue')
        },
        {
          path: '/leads',
          name: 'leads',
          component: () => import('../views/leads.vue')
        },
        {
          path: '/students',
          name: 'students',
          component: () => import('../views/students/students.vue')
        },
        {
          path: '/stopped',
          name: 'stopped',
          component: () => import('../views/students/stopped.vue')
        },
        {
          path: '/ignored',
          name: 'ignored',
          component: () => import('../views/students/ignored.vue')
        },
        {
          path: '/finished',
          name: 'finished',
          component: () => import('../views/students/finished.vue')
        },
        {
          path: '/payments',
          name: 'payments',
          component: () => import('../views/payments.vue')
        },
        {
          path: '/payroll',
          name: 'payroll',
          component: () => import('../views/payroll.vue')
        },
        {
          path: '/expenses',
          name: 'expenses',
          component: () => import('../views/expenses.vue')
        },
        {
          path: '/statistics',
          name: 'statistics',
          component: () => import('../views/statistics.vue')
        },
        {
          path: '/pending-receipts',
          name: 'pending-receipts',
          component: () => import('../views/pending-receipts.vue')
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('../views/profile.vue')
        }
      ]
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

// Role-based route guards
const restrictedRoutesForReception = [
  '/users',
  '/statistics',
  '/payroll',
  '/expenses',
  '/centers',
  '/pending-receipts',
  '/syllabuses',
  '/today',
]
const restrictedRoutesForTeacher = [
  '/users',
  '/centers',
  '/rooms',
  '/reception',
  '/leads',
  '/students',
  '/stopped',
  '/ignored',
  '/finished',
  '/payments',
  '/payroll',
  '/expenses',
  '/statistics',
  '/pending-receipts',
]

// Admin-only routes (only admin and super_admin can access)
const adminOnlyRoutes = ['/pending-receipts']

// Precise per-route allow-list, derived from backend role guards.
// Only listed routes are constrained here; anything else falls back to the
// per-role restriction lists above. Matches the route and its children.
const routeAllowedRoles: Record<string, string[]> = {
  '/users': ['admin'], // backend: faqat admin (super_admin ham 403)
  '/statistics': ['admin', 'super_admin'], // dashboard: manager/reception/teacher 403
  '/payroll': ['admin', 'super_admin'], // salaries/earnings: manager 403
  '/expenses': ['admin', 'super_admin'], // expenses: manager 403
  '/pending-receipts': ['admin', 'super_admin'],
  '/leads': ['admin', 'super_admin', 'manager', 'reception'], // teacher 403
  '/syllabuses': ['admin', 'super_admin', 'manager', 'teacher'], // reception ko'rmaydi
  '/today': ['teacher'], // o'qituvchining "bugungi darslar"i
}

// Matches the route itself and its child paths (e.g. '/syllabuses' also covers '/syllabuses/5')
const isRestricted = (routes: string[], path: string) =>
  routes.some((route) => path === route || path.startsWith(route + '/'))

// Role uchun boshlang'ich sahifa (bloklanganda yo'naltirish uchun)
const roleHome = (role: string): string => {
  if (role === 'admin' || role === 'super_admin') return '/statistics'
  if (role === 'teacher') return '/today'
  return '/groups'
}

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  // If no token and trying to access protected route, redirect to login
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login')
    return
  }

  // If no token, allow access to login/register
  if (!token) {
    next()
    return
  }

  // If token exists and on login/register, redirect based on role
  if (token && (to.path === '/login' || to.path === '/register')) {
    const userStore = useUserStore()
    let user = userStore.user

    // If user not loaded, try to load it
    if (!user) {
      try {
        const response = await getMe()
        if (response?.user) {
          userStore.setUser(response.user)
          user = response.user
        }
      } catch {
        localStorage.removeItem('token')
        next('/login')
        return
      }
    }

    // Redirect based on role
    if (user) {
      const userRole = user.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        next('/statistics')
      } else if (userRole === 'teacher') {
        next('/today')
      } else {
        next('/profile')
      }
    } else {
      next('/profile')
    }
    return
  }

  // Check role-based access for protected routes
  const userStore = useUserStore()
  let user = userStore.user

  // If user is not loaded yet, try to load it
  if (!user && to.path !== '/login' && to.path !== '/register') {
    try {
      const response = await getMe()
      if (response?.user) {
        userStore.setUser(response.user)
        user = response.user
      }
    } catch {
      localStorage.removeItem('token')
      next('/login')
      return
    }
  }

  if (user) {
    const userRole = user.role

    // Precise per-route allow-list (backend role guards bilan mos)
    for (const [prefix, roles] of Object.entries(routeAllowedRoles)) {
      if (
        (to.path === prefix || to.path.startsWith(prefix + '/')) &&
        !roles.includes(userRole)
      ) {
        next(roleHome(userRole))
        return
      }
    }

    // Check admin-only routes
    if (adminOnlyRoutes.includes(to.path)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        next(roleHome(userRole))
        return
      }
    }

    // Check reception role restrictions
    if (userRole === 'reception' && isRestricted(restrictedRoutesForReception, to.path)) {
      next(roleHome(userRole))
      return
    }

    // Check teacher role restrictions
    if (userRole === 'teacher' && isRestricted(restrictedRoutesForTeacher, to.path)) {
      next(roleHome(userRole))
      return
    }
  }

  next()
})

export default router


