<template>
  <v-app id="inspire" class="app-container">
    <v-navigation-drawer v-model="drawer" class="sidebar" width="280">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <v-icon size="32" color="#01c0c8">mdi-school</v-icon>
          <span class="logo-text">LITECH</span>
        </div>
      </div>
      <v-divider></v-divider>
      <v-list density="compact" class="sidebar-menu">
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

      <!-- User Profile Card -->
      <div class="sidebar-footer">
        <v-card class="user-card" elevation="0">
          <v-card-text class="d-flex align-center pa-3">
            <v-avatar size="40" color="primary" class="mr-3">
              <v-icon color="white">mdi-account</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-body-2 font-weight-medium">
                {{ userStore.user?.email || 'User' }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ getRoleLabel(userStore.user?.role || '') }}
              </div>
            </div>
            <v-btn
              icon
              size="small"
              variant="text"
              :loading="logoutLoading"
              :disabled="logoutLoading"
              @click="handleLogout"
            >
              <v-icon size="20">mdi-logout</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </v-navigation-drawer>

    <v-app-bar class="app-bar" elevation="1" height="70">
      <v-app-bar-nav-icon @click="drawer = !drawer" size="large"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" variant="text" class="mr-2">
            <v-avatar size="36" color="primary">
              <v-icon color="white" size="20">mdi-account</v-icon>
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
          <v-list-item @click="handleLogout" :disabled="logoutLoading">
            <template v-slot:prepend>
              <v-icon>mdi-logout</v-icon>
            </template>
            <v-list-item-title>Chiqish</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="main-content">
      <div class="content-wrapper">
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
    { text: 'Leads', icon: 'mdi-account-plus', path: '/leads' },
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
const logoutLoading = ref(false)

const getRoleLabel = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Administrator',
    super_admin: 'Super Administrator',
    teacher: "O'qituvchi",
    reception: 'Qabul',
    manager: 'Menejer',
  }
  return roleLabels[role] || role
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  if (logoutLoading.value) return
  logoutLoading.value = true
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
    logoutLoading.value = false
  }
}
</script>

<style scoped>
.app-container {
  background: #f5f7fa;
}

.sidebar {
  background: white !important;
  border-right: 1px solid #e5e7eb;
}

.sidebar-header {
  padding: 24px 20px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
}

.sidebar-menu {
  padding: 8px;
}

.sidebar-menu :deep(.v-list-item) {
  border-radius: 8px;
  margin: 0 8px 4px 8px;
  min-height: 44px;
  padding-left: 12px !important;
  padding-right: 12px !important;
}

.sidebar-menu :deep(.v-list-item--active) {
  background: #01c0c8 !important;
  color: white !important;
}

.sidebar-menu :deep(.v-list-item--active .v-icon) {
  color: white !important;
}

.sidebar-menu :deep(.v-list-item--active .v-list-item-title) {
  color: white !important;
  font-weight: 500;
}

.sidebar-menu :deep(.v-list-group__items .v-list-item) {
  padding-left: 48px !important;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.user-card {
  border-radius: 12px;
  background: #f9fafb;
}

.app-bar {
  background: white !important;
  border-bottom: 1px solid #e5e7eb;
}

.main-content {
  background: #f5f7fa;
}

.content-wrapper {
  padding: 24px;
  max-width: 100%;
}

@media (max-width: 960px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style>
