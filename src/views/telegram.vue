<template>
  <v-container fluid>
    <div class="d-flex align-center mb-4" style="gap: 8px">
      <v-icon icon="mdi-send-circle" color="primary" size="28"></v-icon>
      <h2 class="text-h5">{{ $t('telegram.settings.title') }}</h2>
    </div>

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else-if="settings">
      <!-- Bot ulash: har bir o'quv markazi o'z botini ochadi -->
      <v-card class="mb-4">
        <v-card-title class="text-h6 pa-4">
          {{ $t('telegram.settings.botTitle') }}
        </v-card-title>
        <v-card-text>
          <v-alert
            :type="settings.botConnected ? 'success' : settings.botConfigured ? 'warning' : 'info'"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <template v-if="settings.botConnected">
              {{ $t('telegram.settings.connected', { bot: settings.botUsername ?? '' }) }}
            </template>
            <template v-else-if="settings.botConfigured">
              {{ $t('telegram.settings.tokenSetNotConnected') }}
            </template>
            <template v-else>
              {{ $t('telegram.settings.noBot') }}
            </template>
          </v-alert>

          <!-- Bot ulangan: tokenni ko'rsatmaymiz, faqat niqob -->
          <div v-if="settings.botConfigured && !changingToken" class="d-flex align-center flex-wrap" style="gap: 12px">
            <div>
              <div class="text-caption text-medium-emphasis">
                {{ $t('telegram.settings.currentToken') }}
              </div>
              <div class="text-body-2 font-weight-medium">{{ settings.botTokenMasked }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-btn variant="text" prepend-icon="mdi-key-change" @click="changingToken = true">
              {{ $t('telegram.settings.changeToken') }}
            </v-btn>
            <v-btn
              variant="text"
              color="error"
              prepend-icon="mdi-link-off"
              :loading="removingToken"
              @click="removeToken"
            >
              {{ $t('telegram.settings.disconnectBot') }}
            </v-btn>
          </div>

          <!-- Token kiritish -->
          <template v-else>
            <div class="text-body-2 text-medium-emphasis mb-3">
              {{ $t('telegram.settings.botHint') }}
            </div>
            <v-text-field
              v-model="tokenInput"
              :label="$t('telegram.settings.tokenLabel')"
              placeholder="1234567890:AAF-..."
              variant="outlined"
              density="compact"
              autocomplete="off"
              :error-messages="tokenError ? [tokenError] : []"
              hide-details="auto"
              class="mb-2"
            ></v-text-field>
            <div class="d-flex" style="gap: 8px">
              <v-btn
                color="primary"
                variant="flat"
                :loading="savingToken"
                :disabled="!tokenInput.trim()"
                @click="saveToken"
              >
                {{ $t('telegram.settings.connectBot') }}
              </v-btn>
              <v-btn v-if="changingToken" variant="text" @click="cancelTokenChange">
                {{ $t('common.cancel') }}
              </v-btn>
            </div>
          </template>
        </v-card-text>
      </v-card>

      <v-card class="mb-4">
        <v-card-title class="text-h6 pa-4">
          {{ $t('telegram.settings.notificationsTitle') }}
        </v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-3">
            {{ $t('telegram.settings.notificationsHint') }}
          </div>

          <v-switch
            v-model="form.isEnabled"
            color="primary"
            density="compact"
            hide-details
            :label="$t('telegram.settings.isEnabled')"
          ></v-switch>
          <div class="text-caption text-medium-emphasis mb-3 ms-12">
            {{ $t('telegram.settings.isEnabledHint') }}
          </div>

          <v-divider class="mb-3"></v-divider>

          <!-- Umumiy kalit o'chiq bo'lsa qolganlari ma'nosiz -->
          <div :class="{ 'opacity-50': !form.isEnabled }">
            <v-switch
              v-model="form.notifyPaymentReceived"
              color="primary"
              density="compact"
              hide-details
              :disabled="!form.isEnabled"
              :label="$t('telegram.settings.notifyPaymentReceived')"
            ></v-switch>
            <div class="text-caption text-medium-emphasis mb-3 ms-12">
              {{ $t('telegram.settings.notifyPaymentReceivedHint') }}
            </div>

            <v-switch
              v-model="form.notifyPaymentConfirmed"
              color="primary"
              density="compact"
              hide-details
              :disabled="!form.isEnabled"
              :label="$t('telegram.settings.notifyPaymentConfirmed')"
            ></v-switch>
            <div class="text-caption text-medium-emphasis mb-3 ms-12">
              {{ $t('telegram.settings.notifyPaymentConfirmedHint') }}
            </div>

            <v-switch
              v-model="form.notifyAbsence"
              color="primary"
              density="compact"
              hide-details
              :disabled="!form.isEnabled"
              :label="$t('telegram.settings.notifyAbsence')"
            ></v-switch>
            <div class="text-caption text-medium-emphasis mb-3 ms-12">
              {{ $t('telegram.settings.notifyAbsenceHint') }}
            </div>

            <v-switch
              v-model="form.notifyDebt"
              color="primary"
              density="compact"
              hide-details
              :disabled="!form.isEnabled"
              :label="$t('telegram.settings.notifyDebt')"
            ></v-switch>
            <div class="text-caption text-medium-emphasis mb-3 ms-12">
              {{ $t('telegram.settings.notifyDebtHint') }}
            </div>

            <v-text-field
              v-if="form.notifyDebt"
              v-model.number="form.debtReminderDay"
              type="number"
              min="1"
              max="28"
              variant="outlined"
              density="compact"
              class="ms-12 mb-2"
              style="max-width: 240px"
              :disabled="!form.isEnabled"
              :label="$t('telegram.settings.debtReminderDay')"
              :error-messages="dayError ? [dayError] : []"
              hide-details="auto"
            ></v-text-field>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-btn
            v-if="form.notifyDebt && form.isEnabled"
            variant="text"
            prepend-icon="mdi-bell-ring"
            :loading="sendingReminders"
            @click="sendReminders"
          >
            {{ $t('telegram.settings.sendNow') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!!dayError"
            @click="save"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <!-- Qanday ishlashi -->
      <v-card variant="tonal">
        <v-card-title class="text-subtitle-1 pa-4">
          {{ $t('telegram.settings.howTitle') }}
        </v-card-title>
        <v-card-text class="text-body-2">
          <div class="mb-1">1. {{ $t('telegram.settings.how1') }}</div>
          <div class="mb-1">2. {{ $t('telegram.settings.how2') }}</div>
          <div class="mb-1">3. {{ $t('telegram.settings.how3') }}</div>
          <div>4. {{ $t('telegram.settings.how4') }}</div>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TelegramSettings } from '@/types/telegram.types'
import {
  fetchTelegramSettings,
  removeTelegramBotToken,
  sendTelegramDebtReminders,
  setTelegramBotToken,
  updateTelegramSettings,
} from '@/services/pages/telegram'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'

defineOptions({ name: 'TelegramSettingsPage' })

const { t } = useI18n()
const notify = useNotificationStore()

const settings = ref<TelegramSettings | null>(null)
const loading = ref(false)
const saving = ref(false)
const sendingReminders = ref(false)

// ── Bot tokeni ────────────────────────────────────────────────────
// Token hech qachon serverdan qaytmaydi (faqat niqobi), shuning uchun
// "o'zgartirish" rejimi alohida: maydon bo'sh ochiladi.
const tokenInput = ref('')
const tokenError = ref('')
const savingToken = ref(false)
const removingToken = ref(false)
const changingToken = ref(false)

const form = reactive({
  isEnabled: true,
  notifyPaymentReceived: true,
  notifyPaymentConfirmed: false,
  notifyAbsence: false,
  notifyDebt: false,
  debtReminderDay: 10,
})

// Backendda ham 1..28 (29–31 har oyda bo'lavermaydi — eslatma tushmay qolardi)
const dayError = computed<string>(() => {
  if (!form.notifyDebt) return ''
  const day = Number(form.debtReminderDay)
  if (!Number.isInteger(day) || day < 1 || day > 28) {
    return t('telegram.settings.dayError')
  }
  return ''
})

const applyToForm = (data: TelegramSettings) => {
  settings.value = data
  form.isEnabled = data.isEnabled
  form.notifyPaymentReceived = data.notifyPaymentReceived
  form.notifyPaymentConfirmed = data.notifyPaymentConfirmed
  form.notifyAbsence = data.notifyAbsence
  form.notifyDebt = data.notifyDebt
  form.debtReminderDay = data.debtReminderDay
}

const load = async () => {
  loading.value = true
  try {
    applyToForm(await fetchTelegramSettings())
  } catch (error) {
    console.error('Failed to load telegram settings:', error)
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (dayError.value) return
  saving.value = true
  try {
    applyToForm(await updateTelegramSettings({ ...form }))
    notify.success(t('telegram.settings.saved'))
  } catch (error) {
    console.error('Failed to save telegram settings:', error)
  } finally {
    saving.value = false
  }
}

const saveToken = async () => {
  const token = tokenInput.value.trim()
  if (!token) return
  savingToken.value = true
  tokenError.value = ''
  try {
    applyToForm(await setTelegramBotToken(token))
    tokenInput.value = ''
    changingToken.value = false
    notify.success(t('telegram.settings.botConnected'))
  } catch (error) {
    // Token xatosi aynan maydon ostida ko'rinishi kerak (global toast emas):
    // foydalanuvchi shu yerda qiymatni tuzatadi.
    tokenError.value = apiErrorMessage(error)
  } finally {
    savingToken.value = false
  }
}

const cancelTokenChange = () => {
  changingToken.value = false
  tokenInput.value = ''
  tokenError.value = ''
}

const removeToken = async () => {
  removingToken.value = true
  try {
    applyToForm(await removeTelegramBotToken())
    notify.success(t('telegram.settings.botDisconnected'))
  } catch (error) {
    console.error('Failed to remove bot token:', error)
  } finally {
    removingToken.value = false
  }
}

const sendReminders = async () => {
  sendingReminders.value = true
  try {
    const result = await sendTelegramDebtReminders()
    notify.success(t('telegram.settings.sent', { count: result.students }))
  } catch (error) {
    console.error('Failed to send debt reminders:', error)
  } finally {
    sendingReminders.value = false
  }
}

onMounted(load)
</script>
