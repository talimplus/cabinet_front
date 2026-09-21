<template>
  <v-card class="mb-4">
    <v-card-title class="text-h6 pa-4 d-flex align-center" style="gap: 8px">
      <v-icon icon="mdi-send-circle" color="primary"></v-icon>
      {{ $t('telegram.parentCard.title') }}
    </v-card-title>

    <v-card-text>
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary" size="28"></v-progress-circular>
      </div>

      <template v-else-if="info">
        <!-- Bot serverda sozlanmagan: QR yaratib bo'lmaydi -->
        <v-alert v-if="!info.botConfigured" type="warning" variant="tonal" density="compact">
          {{ $t('telegram.parentCard.botNotConfigured') }}
        </v-alert>

        <v-row v-else>
          <!-- QR -->
          <v-col cols="12" sm="auto" class="text-center">
            <img
              v-if="info.qrDataUrl"
              :src="info.qrDataUrl"
              :alt="$t('telegram.parentCard.title')"
              class="qr-image"
            />
            <div class="d-flex justify-center mt-2" style="gap: 4px">
              <v-btn
                size="small"
                variant="text"
                prepend-icon="mdi-download"
                @click="downloadQr"
              >
                {{ $t('telegram.parentCard.download') }}
              </v-btn>
              <v-btn
                v-if="canEdit"
                size="small"
                variant="text"
                color="warning"
                prepend-icon="mdi-refresh"
                :loading="regenerating"
                @click="confirmRegenerate = true"
              >
                {{ $t('telegram.parentCard.regenerate') }}
              </v-btn>
            </div>
          </v-col>

          <!-- Havola + ko'rsatma -->
          <v-col cols="12" sm>
            <div class="text-body-2 text-medium-emphasis mb-3">
              {{ $t('telegram.parentCard.hint') }}
            </div>

            <v-text-field
              :model-value="info.deepLink ?? ''"
              :label="$t('telegram.parentCard.link')"
              variant="outlined"
              density="compact"
              readonly
              hide-details
              append-inner-icon="mdi-content-copy"
              @click:append-inner="copyLink"
            ></v-text-field>

            <!-- Ulangan ota-onalar -->
            <div class="text-subtitle-2 mt-4 mb-1">
              {{ $t('telegram.parentCard.parents') }}
            </div>

            <div v-if="!activeParents.length" class="text-body-2 text-medium-emphasis">
              {{ $t('telegram.parentCard.noParents') }}
            </div>

            <div
              v-for="parent in activeParents"
              :key="parent.id"
              class="d-flex align-center py-1 parent-row"
              style="gap: 8px"
            >
              <v-icon icon="mdi-account-check" color="success" size="18"></v-icon>
              <span class="text-body-2">{{ parentName(parent) }}</span>
              <span v-if="parent.username" class="text-caption text-medium-emphasis">
                @{{ parent.username }}
              </span>
              <span class="text-caption text-medium-emphasis">
                · {{ formatDate(parent.linkedAt) }}
              </span>
              <v-btn
                v-if="canEdit"
                icon="mdi-link-off"
                size="x-small"
                variant="text"
                color="error"
                :loading="unlinkingId === parent.id"
                @click="unlink(parent.id)"
              ></v-btn>
            </div>

            <!-- Bloklangan/uzilgan ulanishlar — nima uchun xabar bormayotganini tushuntiradi -->
            <div v-if="blockedParents.length" class="mt-2">
              <span class="text-caption text-warning">
                {{ $t('telegram.parentCard.blocked', { count: blockedParents.length }) }}
              </span>
            </div>
          </v-col>
        </v-row>
      </template>
    </v-card-text>

    <!-- QR yangilash tasdig'i: eski QR darhol ishlamay qoladi -->
    <v-dialog v-model="confirmRegenerate" max-width="440">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          {{ $t('telegram.parentCard.regenerateTitle') }}
        </v-card-title>
        <v-card-text class="pa-4 pt-0 text-body-2">
          {{ $t('telegram.parentCard.regenerateConfirm') }}
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="confirmRegenerate = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="warning" variant="flat" :loading="regenerating" @click="regenerate">
            {{ $t('telegram.parentCard.regenerate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TelegramParent, TelegramStudentLink } from '@/types/telegram.types'
import {
  fetchStudentTelegramLink,
  regenerateStudentTelegramQr,
  unlinkTelegramParent,
} from '@/services/pages/telegram'
import { useNotificationStore } from '@/stores/notification'
import { usePermissions } from '@/composables/usePermissions'

defineOptions({ name: 'TelegramParentCard' })

const props = defineProps<{
  studentId: number
  /** Fayl nomida ishlatiladi: "Ali_Valiyev_telegram_qr.png" */
  studentName?: string
}>()

const { t } = useI18n()
const notify = useNotificationStore()
const { canEditStudent } = usePermissions()

const info = ref<TelegramStudentLink | null>(null)
const loading = ref(false)
const regenerating = ref(false)
const unlinkingId = ref<number | null>(null)
const confirmRegenerate = ref(false)

const canEdit = computed(() => canEditStudent.value)

const activeParents = computed(() =>
  (info.value?.parents ?? []).filter((p) => p.isActive),
)

// Uzilgan ulanishlardan faqat botni bloklaganlari qiziq: admin o'zi uzganini
// biladi, bloklaganini esa bilmaydi — shuning uchun alohida ko'rsatiladi.
const blockedParents = computed(() =>
  (info.value?.parents ?? []).filter((p) => !p.isActive && p.blockedAt),
)

const parentName = (parent: TelegramParent): string => {
  const name = `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim()
  return name || t('telegram.parentCard.unnamed')
}

const formatDate = (value: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const load = async () => {
  loading.value = true
  try {
    info.value = await fetchStudentTelegramLink(props.studentId)
  } catch (error) {
    console.error('Failed to load telegram link:', error)
  } finally {
    loading.value = false
  }
}

const copyLink = async () => {
  const link = info.value?.deepLink
  if (!link) return
  try {
    await navigator.clipboard.writeText(link)
    notify.success(t('telegram.parentCard.copied'))
  } catch {
    notify.error(t('telegram.parentCard.copyFailed'))
  }
}

// QR ni chop etish uchun yuklab olish (data URL to'g'ridan-to'g'ri saqlanadi)
const downloadQr = () => {
  const src = info.value?.qrDataUrl
  if (!src) return
  const link = document.createElement('a')
  link.href = src
  const name = (props.studentName ?? `student-${props.studentId}`)
    .trim()
    .replace(/\s+/g, '_')
  link.download = `${name}_telegram_qr.png`
  link.click()
}

const regenerate = async () => {
  regenerating.value = true
  try {
    info.value = await regenerateStudentTelegramQr(props.studentId)
    confirmRegenerate.value = false
    notify.success(t('telegram.parentCard.regenerated'))
  } catch (error) {
    console.error('Failed to regenerate QR:', error)
  } finally {
    regenerating.value = false
  }
}

const unlink = async (linkId: number) => {
  unlinkingId.value = linkId
  try {
    await unlinkTelegramParent(linkId)
    await load()
    notify.success(t('telegram.parentCard.unlinked'))
  } catch (error) {
    console.error('Failed to unlink parent:', error)
  } finally {
    unlinkingId.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.qr-image {
  width: 180px;
  height: 180px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  background: #fff;
}
.parent-row + .parent-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
