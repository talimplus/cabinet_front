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
]
const restrictedRoutesForTeacher = [
  '/users',
  '/centers',
  '/rooms',
  '/reception',
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

    // Check admin-only routes
    if (adminOnlyRoutes.includes(to.path)) {
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        next('/groups') // Redirect to allowed page
        return
      }
    }

    // Check reception role restrictions
    if (userRole === 'reception' && restrictedRoutesForReception.includes(to.path)) {
      next('/groups') // Redirect to allowed page
      return
    }

    // Check teacher role restrictions
    if (userRole === 'teacher' && restrictedRoutesForTeacher.includes(to.path)) {
      next('/groups') // Redirect to allowed page
      return
    }
  }

  next()
})

export default router


