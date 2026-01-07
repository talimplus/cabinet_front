<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer">
      <v-list density="compact">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
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
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Ta'lim Markazi</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <div class="py-6 px-4">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>
      
      <script  setup lang="ts">
import { ref } from 'vue'
const items = [
  { text: 'Foydalanuvchilar', icon: 'mdi-account', path: '/users' },
  { text: 'Fanlar', icon: 'mdi-clock', path: '/subjects' },
  { text: 'Markazlar', icon: 'mdi-domain', path: '/centers' },
  { text: 'Guruhlar', icon: 'mdi-flag', path: '/groups' },
  { text: 'Xonalar', icon: 'mdi-flag', path: '/rooms' },
  { text: 'Qabul', icon: 'mdi-account-school', path: '/reception' },
  { text: 'O\'quvchilar', icon: 'mdi-account-school', path: '/students' },
  { text: 'To\'xtatilgan', icon: 'mdi-account-school', path: '/stopped' },
  { text: 'E\'tiborsiz', icon: 'mdi-account-school', path: '/ignored' },
  { text: 'Tugallangan', icon: 'mdi-account-school', path: '/finished' },
  { text: 'To\'lovlar', icon: 'mdi-cash', path: '/payments' },
]
const drawer = ref(null)
</script>
      
 