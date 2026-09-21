<template>
  <v-dialog v-model="open" width="520">
    <Form @submit="submit" ref="centerForm">
      <v-card :title="$t('centers.dialog.createTitle')">
        <v-card-text>
          <Field name="name" v-slot="{ handleChange, handleBlur, errors }">
            <v-text-field
              v-model="form.name"
              :label="$t('centers.form.centerName')"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-text-field>
          </Field>

          <Field name="isDefault" v-slot="{ handleChange, handleBlur, errors }">
            <v-checkbox
              v-model="form.isDefault"
              :label="$t('centers.form.defaultCenter')"
              density="compact"
              class="mt-2"
              :error-messages="errors"
              @update:model-value="handleChange"
              @blur="handleBlur"
            ></v-checkbox>
          </Field>

          <!--
            Xodim davomati sozlamalari. Faqat tahrirlashda ko'rinadi, chunki
            IP'ni olish uchun markazning id'si kerak.
          -->
          <template v-if="props.formForEdit?.id">
            <v-divider class="my-4"></v-divider>
            <div class="text-subtitle-2 mb-1">{{ $t('centers.attendance.title') }}</div>
            <div class="text-caption text-medium-emphasis mb-3">
              {{ $t('centers.attendance.hint') }}
            </div>

            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="form.latitude"
                  type="number"
                  step="0.0000001"
                  :label="$t('centers.attendance.latitude')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.longitude"
                  type="number"
                  step="0.0000001"
                  :label="$t('centers.attendance.longitude')"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-btn
              variant="tonal"
              size="small"
              prepend-icon="mdi-crosshairs-gps"
              class="mb-3"
              :loading="geoLoading"
              @click="useCurrentPosition"
            >
              {{ $t('centers.attendance.useMyLocation') }}
            </v-btn>

            <v-text-field
              v-model.number="form.checkInRadiusMeters"
              type="number"
              :label="$t('centers.attendance.radius')"
              :hint="$t('centers.attendance.radiusHint')"
              persistent-hint
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="form.publicIp"
              :label="$t('centers.attendance.publicIp')"
              :hint="$t('centers.attendance.publicIpHint')"
              persistent-hint
              variant="outlined"
              density="compact"
              clearable
            ></v-text-field>

            <v-btn
              variant="tonal"
              size="small"
              color="primary"
              prepend-icon="mdi-wifi-check"
              class="mt-3"
              :loading="ipLoading"
              @click="captureIp"
            >
              {{ $t('centers.attendance.captureIp') }}
            </v-btn>
          </template>
        </v-card-text>
        <template v-slot:actions>
          <v-btn :text="$t('common.cancel')" @click="open = false"></v-btn>
          <v-btn
            v-if="canManageCenters"
            :loading="loading"
            :disabled="loading"
            type="submit"
            color="primary"
            :text="$t('common.save')"
          ></v-btn>
        </template>
      </v-card>
    </Form>
  </v-dialog>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { ref, defineProps, watch, defineEmits, defineModel } from 'vue'
import { useI18n } from 'vue-i18n'
import { Form, Field } from 'vee-validate'
import type { CenterForm } from '@/types/centers.types'
import {
  captureCenterIp,
  createCenter,
  editCenter,
} from '@/services/pages/centers'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage, apiFieldErrors } from '@/services/apiError'
import type { Center } from '@/types/centers.types'

const { canManageCenters } = usePermissions()
const { t } = useI18n()
const notify = useNotificationStore()

interface Props {
  test: { name: string }
  formForEdit: Center
}

interface Emits {
  (e: 'close'): void
  (e: 'updateData'): void
  (e: 'clearEditForm'): void
  (e: 'chaqiryapman', text: string, kilo: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()
const open = defineModel('open', {default: false})
const centerForm = ref()

// const dialog = ref(false)
const loading = ref(false)
const geoLoading = ref(false)
const ipLoading = ref(false)
const form = ref<CenterForm>({
  name: '',
  isDefault: false,
})

watch(
  () => open.value,
  (newValue) => {
    if (newValue && props.formForEdit?.id) {
      form.value.name = props.formForEdit.name
      form.value.isDefault = props.formForEdit.isDefault || false
      form.value.latitude = props.formForEdit.latitude ?? null
      form.value.longitude = props.formForEdit.longitude ?? null
      form.value.checkInRadiusMeters = props.formForEdit.checkInRadiusMeters ?? 150
      form.value.publicIp = props.formForEdit.publicIp ?? null
    } else {
      emits('clearEditForm')
      form.value = {
        name: '',
        isDefault: false,
      }
    }
  }
)

/** Bo'sh yoki noto'g'ri koordinata → null (backendda 0 bo'lib qolmasligi uchun) */
const toCoord = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

/** Admin markazda turib bossa — brauzer koordinatasi maydonlarga tushadi */
const useCurrentPosition = () => {
  if (!navigator.geolocation) {
    notify.error(t('centers.attendance.geoUnsupported'))
    return
  }
  geoLoading.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.value.latitude = Number(position.coords.latitude.toFixed(7))
      form.value.longitude = Number(position.coords.longitude.toFixed(7))
      geoLoading.value = false
      notify.success(t('centers.attendance.geoTaken'))
    },
    () => {
      geoLoading.value = false
      notify.error(t('centers.attendance.geoDenied'))
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  )
}

/** Markaz Wi-Fi'siga ulangan holda bosiladi — tashqi IP serverdan olinadi */
const captureIp = async () => {
  if (!props.formForEdit?.id) return
  try {
    ipLoading.value = true
    const { publicIp } = await captureCenterIp(props.formForEdit.id)
    form.value.publicIp = publicIp
    notify.success(t('centers.attendance.ipTaken', { ip: publicIp }))
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('centers.attendance.ipError'))
  } finally {
    ipLoading.value = false
  }
}

const submit = async () => {
  try {
    loading.value = true
    if (props.formForEdit?.id) {
      // Bo'sh maydon "0" bo'lib ketmasligi uchun aniq null ga aylantiramiz
      const payload: CenterForm = {
        ...form.value,
        latitude: toCoord(form.value.latitude),
        longitude: toCoord(form.value.longitude),
        publicIp: form.value.publicIp?.trim() ? form.value.publicIp.trim() : null,
      }
      await editCenter(payload, props.formForEdit.id)
    } else {
      await createCenter({ name: form.value.name, isDefault: form.value.isDefault })
    }
    open.value = false
    emits('updateData')
  } catch (err) {
    const errors = apiFieldErrors(err)
    if (errors) {
      centerForm.value?.setErrors(errors)
    }
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>
