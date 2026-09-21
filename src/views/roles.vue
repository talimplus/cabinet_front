<template>
  <v-card>
    <v-card-title class="mb-2 d-flex justify-space-between align-center">
      {{ t('roles.title') }}
      <v-btn v-if="canManage" color="primary" @click="openCreate">
        {{ t('roles.create') }}
      </v-btn>
    </v-card-title>

    <v-card-subtitle class="pb-4">{{ t('roles.subtitle') }}</v-card-subtitle>

    <v-card-text>
      <v-data-table
        :loading="loading"
        :items="roles"
        :headers="headers"
        hide-default-footer
        :items-per-page="-1"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-2">
            <span class="font-weight-medium">{{ item.name }}</span>
            <v-chip v-if="item.isLocked" size="x-small" color="primary" variant="tonal">
              {{ t('roles.badges.locked') }}
            </v-chip>
            <v-chip v-else-if="item.isSystem" size="x-small" variant="tonal">
              {{ t('roles.badges.system') }}
            </v-chip>
          </div>
        </template>

        <template #item.baseRole="{ item }">
          {{ baseRoleLabel(item.baseRole) }}
        </template>

        <template #item.permissions="{ item }">
          <span v-if="item.permissions.includes('*')">{{ t('roles.allPermissions') }}</span>
          <span v-else>{{ t('roles.permissionCount', { count: item.permissions.length }) }}</span>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="canManage && !item.isLocked"
            @click="openEdit(item)"
            density="compact"
            color="medium-emphasis"
            icon="mdi-pencil"
            size="small"
            class="me-2"
            variant="text"
          ></v-btn>
          <v-btn
            v-if="canManage && !item.isSystem && !item.isLocked"
            @click="confirmRemove(item)"
            density="compact"
            color="medium-emphasis"
            icon="mdi-delete"
            size="small"
            variant="text"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card-text>

    <!-- Rol yaratish / tahrirlash -->
    <v-dialog v-model="formOpen" width="900" scrollable>
      <v-card :title="editing ? t('roles.form.editTitle') : t('roles.form.createTitle')">
        <v-card-text>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                :label="t('roles.form.name')"
                :error-messages="nameError ? [nameError] : []"
                variant="outlined"
                density="compact"
              ></v-text-field>
            </v-col>
            <v-col cols="12" sm="6">
              <v-select
                v-model="form.baseRole"
                :items="baseRoleItems"
                item-title="title"
                item-value="value"
                :label="t('roles.form.baseRole')"
                :hint="t('roles.form.baseRoleHint')"
                :disabled="editing?.isSystem"
                persistent-hint
                variant="outlined"
                density="compact"
              ></v-select>
            </v-col>
          </v-row>

          <div class="d-flex align-center justify-space-between mt-6 mb-2">
            <div class="text-subtitle-1 font-weight-medium">
              {{ t('roles.form.permissions') }}
              <span class="text-medium-emphasis text-body-2">
                ({{ form.permissions.length }})
              </span>
            </div>
            <div>
              <v-btn variant="text" size="small" @click="selectAll">
                {{ t('roles.form.selectAll') }}
              </v-btn>
              <v-btn variant="text" size="small" @click="clearAll">
                {{ t('roles.form.clearAll') }}
              </v-btn>
            </div>
          </div>

          <v-expansion-panels multiple variant="accordion">
            <v-expansion-panel v-for="group in catalog" :key="group.key">
              <v-expansion-panel-title>
                <div class="d-flex align-center ga-3">
                  <span>{{ localeLabel(group.label) }}</span>
                  <v-chip size="x-small" variant="tonal">
                    {{ selectedInGroup(group) }} / {{ group.permissions.length }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-checkbox
                  :model-value="isGroupFull(group)"
                  :indeterminate="isGroupPartial(group)"
                  :label="t('roles.form.selectGroup')"
                  density="compact"
                  hide-details
                  class="mb-2"
                  @update:model-value="toggleGroup(group, $event)"
                ></v-checkbox>
                <v-divider class="mb-2"></v-divider>
                <v-row dense>
                  <v-col
                    v-for="permission in group.permissions"
                    :key="permission.key"
                    cols="12"
                    sm="6"
                  >
                    <v-checkbox
                      v-model="form.permissions"
                      :value="permission.key"
                      :label="localeLabel(permission.label)"
                      density="compact"
                      hide-details
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="formOpen = false" :text="t('common.cancel')"></v-btn>
          <v-btn
            color="primary"
            :loading="saving"
            :disabled="saving"
            :text="t('common.save')"
            @click="submit"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- O'chirishni tasdiqlash -->
    <v-dialog v-model="removeOpen" width="420">
      <v-card :title="t('roles.remove.title')">
        <v-card-text>
          {{ t('roles.remove.confirm', { name: roleToRemove?.name ?? '' }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="removeOpen = false" :text="t('common.cancel')"></v-btn>
          <v-btn
            color="error"
            :loading="removing"
            :text="t('common.delete')"
            @click="remove"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createRole,
  deleteRole,
  fetchPermissionCatalog,
  fetchRoles,
  updateRole,
} from '@/services/pages/roles'
import {
  ASSIGNABLE_BASE_ROLES,
  type BaseRole,
  type PermissionGroup,
  type PermissionLabel,
  type Role,
  type RoleForm,
} from '@/types/roles.types'
import { usePermissions } from '@/composables/usePermissions'

const { t, locale } = useI18n()
const { can } = usePermissions()

const canManage = computed(() => can('roles.manage'))

const roles = ref<Role[]>([])
const catalog = ref<PermissionGroup[]>([])
const loading = ref(false)

const formOpen = ref(false)
const saving = ref(false)
const editing = ref<Role | null>(null)
const nameError = ref('')

const removeOpen = ref(false)
const removing = ref(false)
const roleToRemove = ref<Role | null>(null)

const emptyForm = (): RoleForm => ({ name: '', baseRole: 'other', permissions: [] })
const form = ref<RoleForm>(emptyForm())

/** Katalog yorliqlari backenddan uz/ru bo'lib keladi. */
const localeLabel = (label: PermissionLabel) =>
  locale.value === 'ru' ? label.ru : label.uz

const baseRoleLabel = (baseRole: string) => {
  const key = `roles.baseRoles.${baseRole}`
  const label = t(key)
  return label === key ? baseRole : label
}

const baseRoleItems = computed(() =>
  ASSIGNABLE_BASE_ROLES.map((value) => ({ title: baseRoleLabel(value), value })),
)

const headers = computed(() => [
  { title: t('roles.table.name'), key: 'name' },
  { title: t('roles.table.baseRole'), key: 'baseRole' },
  { title: t('roles.table.permissions'), key: 'permissions' },
  { title: t('roles.table.userCount'), key: 'userCount' },
  { title: t('common.actions'), key: 'actions', sortable: false },
])

// ── Guruh checkbox'lari ────────────────────────────────────────────
const selectedInGroup = (group: PermissionGroup) =>
  group.permissions.filter((p) => form.value.permissions.includes(p.key)).length

const isGroupFull = (group: PermissionGroup) =>
  group.permissions.length > 0 && selectedInGroup(group) === group.permissions.length

const isGroupPartial = (group: PermissionGroup) => {
  const count = selectedInGroup(group)
  return count > 0 && count < group.permissions.length
}

const toggleGroup = (group: PermissionGroup, checked: boolean | null) => {
  const keys = group.permissions.map((p) => p.key)
  form.value.permissions = checked
    ? Array.from(new Set([...form.value.permissions, ...keys]))
    : form.value.permissions.filter((key) => !keys.includes(key))
}

const selectAll = () => {
  form.value.permissions = catalog.value.flatMap((g) => g.permissions.map((p) => p.key))
}

const clearAll = () => {
  form.value.permissions = []
}

// ── Yuklash ────────────────────────────────────────────────────────
const load = async () => {
  loading.value = true
  try {
    const [rolesData, catalogData] = await Promise.all([
      fetchRoles(),
      fetchPermissionCatalog(),
    ])
    roles.value = rolesData
    catalog.value = catalogData
  } finally {
    loading.value = false
  }
}

onMounted(load)

// ── Forma ──────────────────────────────────────────────────────────
const openCreate = () => {
  editing.value = null
  nameError.value = ''
  form.value = emptyForm()
  formOpen.value = true
}

const openEdit = (role: Role) => {
  editing.value = role
  nameError.value = ''
  form.value = {
    name: role.name,
    baseRole: role.baseRole as BaseRole,
    // `*` (admin) tahrirlanmaydi, lekin ehtiyot uchun filtrlaymiz
    permissions: role.permissions.filter((key) => key !== '*'),
  }
  formOpen.value = true
}

const submit = async () => {
  if (!form.value.name.trim()) {
    nameError.value = t('roles.form.nameRequired')
    return
  }
  nameError.value = ''

  saving.value = true
  try {
    if (editing.value) {
      await updateRole(editing.value.id, {
        name: form.value.name,
        permissions: form.value.permissions,
        // tizim rolining turini backend ham qabul qilmaydi
        ...(editing.value.isSystem ? {} : { baseRole: form.value.baseRole }),
      })
    } else {
      await createRole(form.value)
    }
    formOpen.value = false
    await load()
  } finally {
    saving.value = false
  }
}

// ── O'chirish ──────────────────────────────────────────────────────
const confirmRemove = (role: Role) => {
  roleToRemove.value = role
  removeOpen.value = true
}

const remove = async () => {
  if (!roleToRemove.value) return
  removing.value = true
  try {
    await deleteRole(roleToRemove.value.id)
    removeOpen.value = false
    await load()
  } finally {
    removing.value = false
  }
}
</script>

<style scoped></style>
