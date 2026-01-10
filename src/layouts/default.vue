<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list density="compact">
        <!-- Statistics (standalone) -->
        <v-list-item
          v-for="item in standaloneItems"
          :key="item.path"
          :value="item"
          color="primary"
          link
          :to="item.path"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title v-text="item.text"></v-list-item-title>
        </v-list-item>

        <!-- Payment Group -->
        <v-list-group v-if="hasPaymentGroup" value="payment-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cash-multiple" title="To'lovlar">
            </v-list-item>
          </template>
          <v-list>
            <v-list-item
              v-for="item in paymentGroupItems"
              :key="item.path"
              :value="item"
              color="primary"
              link
              :to="item.path"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>

        <!-- Students Group -->
        <v-list-group v-if="hasStudentsGroup" value="students-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-account-school" title="O'quvchilar">
            </v-list-item>
          </template>
          <v-list>
            <v-list-item
              v-for="item in studentsGroupItems"
              :key="item.path"
              :value="item"
              color="primary"
              link
              :to="item.path"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>

        <!-- Settings Group -->
        <v-list-group v-if="hasSettingsGroup" value="settings-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" title="Sozlamalar">
            </v-list-item>
          </template>
          <v-list>
            <v-list-item
              v-for="item in settingsGroupItems"
              :key="item.path"
              :value="item"
              color="primary"
              link
              :to="item.path"
            >
              <template v-slot:prepend>
                <v-icon :icon="item.icon"></v-icon>
              </template>
              <v-list-item-title v-text="item.text"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Ta'lim Markazi</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="text">
            <v-avatar size="32" color="primary">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="goToProfile">
            <template v-slot:prepend>
              <v-icon>mdi-account</v-icon>
            </template>
            <v-list-item-title>Profil</v-list-item-title>
          </v-list-item>
          <v-list-item @click="handleLogout">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Chiqish</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <div class="py-6 px-4">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logout } from '@/services/pages/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Menu items organized by groups
const allItems = {
  standalone: [
    { text: 'Profil', icon: 'mdi-account-circle', path: '/profile' },
    { text: 'Statistika', icon: 'mdi-chart-line', path: '/statistics' },
    { text: 'Ishchilar', icon: 'mdi-account', path: '/users' },
    { text: 'Guruhlar', icon: 'mdi-flag', path: '/groups' },
  ],
  payment: [
    { text: "To'lovlar", icon: 'mdi-cash', path: '/payments' },
    { text: 'Ish haqi', icon: 'mdi-cash-multiple', path: '/payroll' },
    { text: 'Chiqimlar', icon: 'mdi-cash-minus', path: '/expenses' },
    {
      text: "Tasdiqlash uchun to'lovlar",
      icon: 'mdi-receipt-text-check',
      path: '/pending-receipts',
      adminOnly: true,
    },
  ],
  students: [
    { text: 'Qabul', icon: 'mdi-account-school', path: '/reception' },
    { text: "O'quvchilar", icon: 'mdi-account-school', path: '/students' },
    { text: "To'xtatilgan", icon: 'mdi-account-school', path: '/stopped' },
    { text: "E'tiborsiz", icon: 'mdi-account-school', path: '/ignored' },
    { text: 'Tugallangan', icon: 'mdi-account-school', path: '/finished' },
  ],
  settings: [
    { text: 'Markazlar', icon: 'mdi-domain', path: '/centers' },
    { text: 'Fanlar', icon: 'mdi-clock', path: '/subjects' },
    { text: 'Xonalar', icon: 'mdi-door', path: '/rooms' },
  ],
}

// Role-based restrictions
const restrictedRoutesForReception = ['/users', '/statistics', '/payroll', '/expenses', '/centers']
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
]

const filterItems = (items: any[]) => {
  const user = userStore.user
  if (!user) return items

  const userRole = user.role
  let restrictedRoutes: string[] = []

  if (userRole === 'reception') {
    restrictedRoutes = restrictedRoutesForReception
  } else if (userRole === 'teacher') {
    restrictedRoutes = restrictedRoutesForTeacher
  }

  return items.filter((item) => {
    // Filter admin-only items
    if (item.adminOnly && userRole !== 'admin' && userRole !== 'super_admin') {
      return false
    }
    // Filter restricted routes
    return !restrictedRoutes.includes(item.path)
  })
}

const standaloneItems = computed(() => filterItems(allItems.standalone))
const paymentGroupItems = computed(() => filterItems(allItems.payment))
const studentsGroupItems = computed(() => filterItems(allItems.students))
const settingsGroupItems = computed(() => filterItems(allItems.settings))

const hasPaymentGroup = computed(() => paymentGroupItems.value.length > 0)
const hasStudentsGroup = computed(() => studentsGroupItems.value.length > 0)
const hasSettingsGroup = computed(() => settingsGroupItems.value.length > 0)

const drawer = ref(null)

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    // Clear token from localStorage
    localStorage.removeItem('token')
    // Clear user from store
    const userStore = useUserStore()
    userStore.clearUser()
    // Redirect to login page
    router.push('/login')
  }
}
</script>
