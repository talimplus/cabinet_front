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
          component: () => import('../views/groups.vue')
        },
        {
          path: '/centers',
          name: 'centers',
          component: () => import('../views/centers.vue')
        },
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

export default router
