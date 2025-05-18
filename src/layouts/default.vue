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

      <v-app-bar-title>Application</v-app-bar-title>
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
  { text: 'Users', icon: 'mdi-account', path: '/users' },
  { text: 'Subjects', icon: 'mdi-clock', path: '/subjects' },
  { text: 'Centers', icon: 'mdi-domain', path: '/centers' },
  { text: 'Groups', icon: 'mdi-flag', path: '/groups' },
]
const drawer = ref(null)
</script>
      
 