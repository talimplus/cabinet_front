import { createRouter, createWebHistory } from 'vue-router'

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

// beforeeach


export default router


