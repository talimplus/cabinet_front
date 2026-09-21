<template>
  <v-card v-if="canCheckIn" class="mb-6" :loading="loading">
    <v-card-text>
      <div class="d-flex align-center flex-wrap" style="gap: 16px">
        <v-avatar :color="statusColor" size="48" variant="tonal">
          <v-icon :icon="statusIcon" size="26"></v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <div class="text-h6">
            {{ today?.checkedIn ? $t('staffAttendance.card.checkedIn') : $t('staffAttendance.card.notCheckedIn') }}
          </div>

          <!-- Belgilangan: vaqti va kechikish -->
          <div v-if="today?.checkedIn" class="text-body-2 text-medium-emphasis">
            {{ $t('staffAttendance.card.arrivedAt', { time: formatTime(today.attendance?.checkInAt) }) }}
            <template v-if="(today.attendance?.lateMinutes ?? 0) > 0">
              ·
              <span class="text-warning">
                {{ $t('staffAttendance.card.lateBy', { minutes: today.attendance?.lateMinutes }) }}
              </span>
            </template>
          </div>

          <!-- Belgilanmagan: bugungi birinchi dars -->
          <div v-else class="text-body-2 text-medium-emphasis">
            <template v-if="today?.firstLessonAt">
              {{ $t('staffAttendance.card.firstLesson', { time: today.firstLessonAt.slice(0, 5) }) }}
            </template>
            <template v-else>
              {{ $t('staffAttendance.card.noLessonToday') }}
            </template>
          </div>
        </div>

        <v-btn
          v-if="!today?.checkedIn"
          color="primary"
          size="large"
          :loading="submitting"
          prepend-icon="mdi-map-marker-check"
          @click="submit"
        >
          {{ $t('staffAttendance.card.checkInButton') }}
        </v-btn>
      </div>

      <!-- Joylashuv yozib olinishini oldindan aytamiz: bu eng arzon to'siq -->
      <v-alert
        v-if="!today?.checkedIn"
        type="info"
        variant="tonal"
        density="compact"
        class="mt-4"
        :text="$t('staffAttendance.card.geoNotice')"
      ></v-alert>

      <v-alert
        v-else-if="warningFlags.length"
        type="warning"
        variant="tonal"
        density="compact"
        class="mt-4"
      >
        {{ warningFlags.map((flag) => $t(`staffAttendance.flags.${flag}`)).join(' · ') }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissions } from '@/composables/usePermissions'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'
import { checkIn, fetchMyAttendanceToday } from '@/services/pages/staffAttendance'
import type {
  AttendanceFlag,
  CheckInPayload,
  StaffAttendanceToday,
} from '@/types/staffAttendance.types'

defineOptions({ name: 'CheckInCard' })

const { t } = useI18n()
const notify = useNotificationStore()
const { can } = usePermissions()

const canCheckIn = computed(() => can('staffAttendance.checkIn'))

const today = ref<StaffAttendanceToday | null>(null)
const loading = ref(false)
const submitting = ref(false)

const statusColor = computed(() => {
  if (!today.value?.checkedIn) return 'primary'
  return (today.value.attendance?.lateMinutes ?? 0) > 0 ? 'warning' : 'success'
})

const statusIcon = computed(() =>
  today.value?.checkedIn ? 'mdi-check-circle-outline' : 'mdi-map-marker-outline',
)

/**
 * Foydalanuvchining o'ziga ko'rsatiladigan bayroqchalar. "Bugun darsi yo'q"
 * ayblov emas — uni chiqarmaymiz.
 */
const warningFlags = computed<AttendanceFlag[]>(
  () =>
    (today.value?.attendance?.flags ?? []).filter(
      (flag) => flag !== 'no_lesson_today' && flag !== 'center_not_configured',
    ) as AttendanceFlag[],
)

const formatTime = (iso?: string | null): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Qurilma ID'si — bitta telefondan bir necha xodim kirishini aniqlash uchun */
const getDeviceId = (): string | undefined => {
  try {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('deviceId', id)
    }
    return id
  } catch {
    // Private rejimda localStorage yopiq bo'lishi mumkin — qurilmasiz davom etamiz
    return undefined
  }
}

/** Joylashuvni so'raymiz, lekin rad etilsa ham check-in to'xtamaydi */
const getPosition = (): Promise<GeolocationPosition | null> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  })

const load = async () => {
  if (!canCheckIn.value) return
  try {
    loading.value = true
    today.value = await fetchMyAttendanceToday()
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  try {
    submitting.value = true

    const position = await getPosition()
    const payload: CheckInPayload = { deviceId: getDeviceId() }
    if (position) {
      payload.latitude = position.coords.latitude
      payload.longitude = position.coords.longitude
      payload.accuracyMeters = Math.round(position.coords.accuracy)
    }

    const result = await checkIn(payload)
    await load()

    if (result.alreadyCheckedIn) {
      notify.info(t('staffAttendance.card.alreadyCheckedIn'))
    } else if ((result.attendance.lateMinutes ?? 0) > 0) {
      notify.warning(
        t('staffAttendance.card.lateBy', { minutes: result.attendance.lateMinutes }),
      )
    } else {
      notify.success(t('staffAttendance.card.success'))
    }
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('staffAttendance.card.error'))
  } finally {
    submitting.value = false
  }
}

onMounted(load)

defineExpose({ load })
</script>
