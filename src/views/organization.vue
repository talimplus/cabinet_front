<template>
  <v-container fluid>
    <div class="d-flex align-center mb-4" style="gap: 8px">
      <v-icon icon="mdi-palette-outline" color="primary" size="28"></v-icon>
      <h2 class="text-h5">{{ $t('organization.title') }}</h2>
    </div>

    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <template v-else>
      <v-card class="mb-4">
        <v-card-title class="text-h6 pa-4">{{ $t('organization.brandTitle') }}</v-card-title>
        <v-card-text>
          <div class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('organization.brandHint') }}
          </div>

          <v-text-field
            v-model="form.name"
            :label="$t('organization.name')"
            variant="outlined"
            density="compact"
            :error-messages="nameError ? [nameError] : []"
            hide-details="auto"
            class="mb-4"
            style="max-width: 420px"
          ></v-text-field>

          <v-row>
            <!-- Logotip -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 mb-1">{{ $t('organization.logo') }}</div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ $t('organization.logoHint') }}
              </div>
              <div class="preview-box logo-box mb-2">
                <img v-if="form.logoUrl" :src="form.logoUrl" class="logo-preview" alt="logo" />
                <span v-else class="text-caption text-medium-emphasis">
                  {{ $t('organization.noImage') }}
                </span>
              </div>
              <div class="d-flex" style="gap: 8px">
                <v-btn size="small" variant="tonal" prepend-icon="mdi-upload" @click="pickLogo">
                  {{ $t('organization.upload') }}
                </v-btn>
                <v-btn
                  v-if="form.logoUrl"
                  size="small"
                  variant="text"
                  color="error"
                  @click="form.logoUrl = ''"
                >
                  {{ $t('organization.remove') }}
                </v-btn>
              </div>
              <input
                ref="logoInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="d-none"
                @change="onLogoChange"
              />
            </v-col>

            <!-- Favicon -->
            <v-col cols="12" md="6">
              <div class="text-subtitle-2 mb-1">{{ $t('organization.favicon') }}</div>
              <div class="text-caption text-medium-emphasis mb-2">
                {{ $t('organization.faviconHint') }}
              </div>
              <div class="preview-box favicon-box mb-2">
                <img
                  v-if="form.faviconUrl"
                  :src="form.faviconUrl"
                  class="favicon-preview"
                  alt="favicon"
                />
                <span v-else class="text-caption text-medium-emphasis">
                  {{ $t('organization.noImage') }}
                </span>
              </div>
              <div class="d-flex" style="gap: 8px">
                <v-btn size="small" variant="tonal" prepend-icon="mdi-upload" @click="pickFavicon">
                  {{ $t('organization.upload') }}
                </v-btn>
                <v-btn
                  v-if="form.faviconUrl"
                  size="small"
                  variant="text"
                  color="error"
                  @click="form.faviconUrl = ''"
                >
                  {{ $t('organization.remove') }}
                </v-btn>
              </div>
              <input
                ref="faviconInput"
                type="file"
                accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
                class="d-none"
                @change="onFaviconChange"
              />
            </v-col>
          </v-row>

          <v-alert
            v-if="fileError"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-4"
          >
            {{ fileError }}
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" :disabled="!isDirty || saving" @click="resetForm">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!isDirty || !!nameError"
            @click="save"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>

      <v-alert type="info" variant="tonal" density="compact">
        {{ $t('organization.domainNote') }}
      </v-alert>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { OrganizationBranding } from '@/types/organization.types'
import { updateOrganizationBranding } from '@/services/pages/organization'
import { useBrandingStore } from '@/stores/branding'
import { useNotificationStore } from '@/stores/notification'

defineOptions({ name: 'OrganizationSettings' })

const { t } = useI18n()
const notify = useNotificationStore()
const brandingStore = useBrandingStore()

// Backenddagi cheklovlar bilan bir xil (data URL base64 ~33% kattaroq)
const MAX_LOGO_BYTES = 300 * 1024
const MAX_FAVICON_BYTES = 100 * 1024

const loading = ref(false)
const saving = ref(false)
const fileError = ref('')
const logoInput = ref<HTMLInputElement | null>(null)
const faviconInput = ref<HTMLInputElement | null>(null)

const form = reactive({ name: '', logoUrl: '', faviconUrl: '' })
const initial = reactive({ name: '', logoUrl: '', faviconUrl: '' })

const nameError = computed<string>(() =>
  form.name.trim().length < 2 ? t('organization.nameError') : '',
)

const isDirty = computed(
  () =>
    form.name !== initial.name ||
    form.logoUrl !== initial.logoUrl ||
    form.faviconUrl !== initial.faviconUrl,
)

const applyData = (data: OrganizationBranding) => {
  form.name = data.name ?? ''
  form.logoUrl = data.logoUrl ?? ''
  form.faviconUrl = data.faviconUrl ?? ''
  Object.assign(initial, { ...form })
}

const resetForm = () => {
  Object.assign(form, { ...initial })
  fileError.value = ''
}

const pickLogo = () => logoInput.value?.click()
const pickFavicon = () => faviconInput.value?.click()

// Rasm data URL sifatida saqlanadi — loyihada fayl yuklash infratuzilmasi yo'q,
// logo esa kichkina va kamdan kam o'zgaradi.
const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const handleFile = async (
  event: Event,
  maxBytes: number,
  target: 'logoUrl' | 'faviconUrl',
) => {
  fileError.value = ''
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  // Bir xil faylni qayta tanlash ham `change` bersin
  input.value = ''
  if (!file) return

  if (file.size > maxBytes) {
    fileError.value = t('organization.tooLarge', {
      size: Math.round(maxBytes / 1024),
    })
    return
  }
  try {
    form[target] = await readAsDataUrl(file)
  } catch {
    fileError.value = t('organization.readFailed')
  }
}

const onLogoChange = (e: Event) => handleFile(e, MAX_LOGO_BYTES, 'logoUrl')
const onFaviconChange = (e: Event) => handleFile(e, MAX_FAVICON_BYTES, 'faviconUrl')

const save = async () => {
  if (nameError.value) return
  saving.value = true
  try {
    const data = await updateOrganizationBranding({
      name: form.name.trim(),
      logoUrl: form.logoUrl,
      faviconUrl: form.faviconUrl,
    })
    applyData(data)
    // Sidebar logosi va tab sarlavhasi darhol yangilanadi
    brandingStore.set(data)
    notify.success(t('organization.saved'))
  } catch (error) {
    console.error('Failed to save branding:', error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    if (!brandingStore.loaded) await brandingStore.load()
    if (brandingStore.branding) applyData(brandingStore.branding)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.preview-box {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background: #fff;
}
.logo-box {
  height: 96px;
  padding: 12px;
}
.favicon-box {
  height: 96px;
  width: 96px;
}
.logo-preview {
  max-height: 72px;
  max-width: 100%;
  object-fit: contain;
}
.favicon-preview {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
</style>
