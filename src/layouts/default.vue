<template>
  <v-app id="inspire" class="app-container">
    <v-navigation-drawer v-model="drawer" class="sidebar" width="280">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="/talimplus-logo.svg" alt="TalimPlus" class="logo-img" />
        </div>
      </div>
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
          <v-list-item-title v-text="t(item.text)"></v-list-item-title>
        </v-list-item>

        <!-- Payment Group -->
        <v-list-group v-if="hasPaymentGroup" value="payment-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cash-multiple" :title="t('layout.groups.payment')">
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
              <v-list-item-title v-text="t(item.text)"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>

        <!-- Students Group -->
        <v-list-group v-if="hasStudentsGroup" value="students-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-account-school" :title="t('layout.groups.students')">
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
              <v-list-item-title v-text="t(item.text)"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>

        <!-- Settings Group -->
        <v-list-group v-if="hasSettingsGroup" value="settings-group">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" prepend-icon="mdi-cog" :title="t('layout.groups.settings')"> </v-list-item>
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
              <v-list-item-title v-text="t(item.text)"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-list-group>
      </v-list>

      <!-- User Profile Card -->
    </v-navigation-drawer>

    <v-app-bar class="app-bar" flat height="66">
      <v-app-bar-nav-icon @click="drawer = !drawer" size="large"></v-app-bar-nav-icon>
      <v-spacer></v-spacer>

      <v-menu location="bottom end" offset="10">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="lang-switcher" size="small">
            <v-icon start size="20">mdi-translate</v-icon>
            {{ locale === 'ru' ? t('layout.russian') : t('layout.uzbek') }}
            <v-icon end size="18">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" width="160">
          <v-list-item
            :active="locale === 'uz'"
            @click="changeLocale('uz')"
            rounded="lg"
          >
            <v-list-item-title>{{ t('layout.uzbek') }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            :active="locale === 'ru'"
            @click="changeLocale('ru')"
            rounded="lg"
          >
            <v-list-item-title>{{ t('layout.russian') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu location="bottom end" offset="10" :close-on-content-click="true">
        <template v-slot:activator="{ props }">
          <button type="button" class="topbar-user" v-bind="props">
            <div class="topbar-user-meta d-none d-sm-block">
              <div class="topbar-user-name">{{ userStore.user?.email || t('layout.user') }}</div>
              <div class="topbar-user-role">{{ getRoleLabel(userStore.user?.role || '') }}</div>
            </div>
            <div class="topbar-avatar-wrap">
              <v-avatar size="40" color="primary" class="topbar-avatar">
                <v-icon color="white" size="22">mdi-account</v-icon>
              </v-avatar>
              <span class="topbar-avatar-status"></span>
            </div>
          </button>
        </template>

        <v-list class="topbar-menu" width="240" density="comfortable">
          <div class="topbar-menu-header">
            <div class="topbar-avatar-wrap">
              <v-avatar size="40" color="primary">
                <v-icon color="white" size="22">mdi-account</v-icon>
              </v-avatar>
              <span class="topbar-avatar-status"></span>
            </div>
            <div class="topbar-menu-meta">
              <div class="topbar-user-name">{{ userStore.user?.email || t('layout.user') }}</div>
              <div class="topbar-user-role">{{ getRoleLabel(userStore.user?.role || '') }}</div>
            </div>
          </div>
          <v-divider class="my-1"></v-divider>
          <v-list-item @click="goToProfile" rounded="lg">
            <template v-slot:prepend>
              <v-icon size="20">mdi-account-outline</v-icon>
            </template>
            <v-list-item-title>{{ t('layout.profile') }}</v-list-item-title>
          </v-list-item>
          <v-list-item
            class="topbar-logout"
            :disabled="logoutLoading"
            rounded="lg"
            @click="handleLogout"
          >
            <template v-slot:prepend>
              <v-icon size="20">mdi-logout</v-icon>
            </template>
            <v-list-item-title>{{ t('layout.logout') }}</v-list-item-title>
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
import { useI18n } from 'vue-i18n'
import { logout } from '@/services/pages/auth'
import { useUserStore } from '@/stores/user'
import { setLocale, type AppLocale } from '@/plugins/i18n'

const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()

const changeLocale = (lang: AppLocale) => {
  setLocale(lang)
}

// Menu items organized by groups (text = i18n key)
const allItems = {
  standalone: [
    { text: 'layout.menu.statistics', icon: 'mdi-chart-line', path: '/statistics' },
    { text: 'layout.menu.users', icon: 'mdi-account', path: '/users' },
    { text: 'layout.menu.groups', icon: 'mdi-flag', path: '/groups' },
  ],
  payment: [
    { text: 'layout.menu.payments', icon: 'mdi-cash', path: '/payments' },
    { text: 'layout.menu.payroll', icon: 'mdi-cash-multiple', path: '/payroll' },
    { text: 'layout.menu.expenses', icon: 'mdi-cash-minus', path: '/expenses' },
    {
      text: 'layout.menu.pendingReceipts',
      icon: 'mdi-receipt-text-check',
      path: '/pending-receipts',
      adminOnly: true,
    },
  ],
  students: [
    { text: 'layout.menu.reception', icon: 'mdi-account-school', path: '/reception' },
    { text: 'layout.menu.leads', icon: 'mdi-account-plus', path: '/leads' },
    { text: 'layout.menu.students', icon: 'mdi-account-school', path: '/students' },
    { text: 'layout.menu.stopped', icon: 'mdi-account-school', path: '/stopped' },
    { text: 'layout.menu.ignored', icon: 'mdi-account-school', path: '/ignored' },
    { text: 'layout.menu.finished', icon: 'mdi-account-school', path: '/finished' },
  ],
  settings: [
    { text: 'layout.menu.centers', icon: 'mdi-domain', path: '/centers' },
    { text: 'layout.menu.subjects', icon: 'mdi-clock', path: '/subjects' },
    { text: 'layout.menu.rooms', icon: 'mdi-door', path: '/rooms' },
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
  if (!role) return ''
  const key = `layout.roles.${role}`
  const label = t(key)
  return label === key ? role : label
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
  background: #f4f5fa;
}

/* ---- Sidebar ---------------------------------------------------------- */
.sidebar {
  background: #ffffff !important;
  border-right: 1px solid rgba(46, 38, 61, 0.12);
}

.sidebar-header {
  padding: 4px 24px;
  margin-bottom: 4px;
  border-bottom: 1px solid lightgray;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  height: 52px;
  width: auto;
}

.sidebar-menu {
  padding: 4px 12px 12px;
}

/* Base nav item */
.sidebar-menu :deep(.v-list-item) {
  border-radius: 8px;
  margin: 2px 0;
  min-height: 42px;
  padding-inline: 12px !important;
  color: rgba(46, 38, 61, 0.68);
  transition:
    background-color 0.18s cubic-bezier(0.22, 1, 0.36, 1),
    color 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar-menu :deep(.v-list-item-title) {
  font-size: 0.9375rem;
  font-weight: 400;
  letter-spacing: 0.01em;
}

.sidebar-menu :deep(.v-list-item .v-icon) {
  color: rgba(46, 38, 61, 0.68);
  font-size: 22px;
}

/* Hover — soft primary tint */
.sidebar-menu :deep(.v-list-item:hover:not(.v-list-item--active)) {
  background: rgba(1, 192, 200, 0.08);
  color: rgb(1, 192, 200);
}

.sidebar-menu :deep(.v-list-item:hover:not(.v-list-item--active) .v-icon) {
  color: rgb(1, 192, 200);
}

/* Active — Materio signature gradient pill with soft brand glow */
.sidebar-menu :deep(.v-list-item--active) {
  background: linear-gradient(
    72.47deg,
    rgb(1, 192, 200) 22.16%,
    rgba(1, 192, 200, 0.7) 76.47%
  ) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px 0 rgba(1, 192, 200, 0.48);
}

.sidebar-menu :deep(.v-list-item--active .v-icon),
.sidebar-menu :deep(.v-list-item--active .v-list-item-title) {
  color: #ffffff !important;
}

.sidebar-menu :deep(.v-list-item--active .v-list-item-title) {
  font-weight: 500;
}

/* Group activator + nested items */
.sidebar-menu :deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 42px !important;
}

/* ---- Topbar (Materio floating navbar) --------------------------------- */
.app-bar {
  background: rgba(244, 245, 250, 0.78) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(46, 38, 61, 0.08);
}

/* User identity block on the right of the header */
.topbar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 6px 4px 12px;
  margin-right: 8px;
  border-radius: 10px;
  cursor: pointer;
  background: transparent;
  transition: background-color 0.18s cubic-bezier(0.22, 1, 0.36, 1);
}

.topbar-user:hover {
  background: rgba(46, 38, 61, 0.05);
}

.topbar-user-meta {
  text-align: right;
  line-height: 1.25;
}

.topbar-user-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: rgba(46, 38, 61, 0.9);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar-user-role {
  font-size: 0.8125rem;
  font-weight: 400;
  color: rgba(46, 38, 61, 0.6);
}

.topbar-avatar-wrap {
  position: relative;
  display: inline-flex;
}

.topbar-avatar {
  box-shadow: 0 2px 6px 0 rgba(1, 192, 200, 0.4);
}

/* Online status dot */
.topbar-avatar-status {
  position: absolute;
  bottom: 1px;
  right: 1px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #56ca00;
  border: 2px solid #ffffff;
}

/* Dropdown menu */
.topbar-menu {
  padding: 6px;
}

.topbar-menu-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 10px;
}

.topbar-menu-meta {
  min-width: 0;
}

.topbar-menu :deep(.topbar-logout) {
  color: rgb(255, 76, 81);
}

.topbar-menu :deep(.topbar-logout .v-icon) {
  color: rgb(255, 76, 81);
}

/* Language switcher in the top bar */
.lang-switcher {
  color: rgba(46, 38, 61, 0.68);
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 500;
  margin-right: 4px;
}

/* ---- Main content ----------------------------------------------------- */
.main-content {
  background: #f4f5fa;
}

.content-wrapper {
  padding: 24px;
  max-width: 1440px;
  margin-inline: auto;
  width: 100%;
}

@media (max-width: 960px) {
  .content-wrapper {
    padding: 16px;
  }
}
</style>
