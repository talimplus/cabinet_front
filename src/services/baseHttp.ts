import router from '@/router/index';
import axios, { type AxiosError } from 'axios';
import i18n from '@/plugins/i18n';
import { useNotificationStore } from '@/stores/notification';
import { useUserStore } from '@/stores/user';
import {
        PermissionDeniedError,
        isPermissionDeniedError,
        permissionsForRequest,
} from '@/permissions/apiPermissions';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

http.interceptors.request.use(function (config) {
        const token = localStorage.getItem('token');

        if (token) config.headers.Authorization = `Bearer ${token}`

        // Ruxsati yo'q endpointga so'rov umuman yubormaymiz — 403 va keraksiz
        // xato xabari o'rniga jim to'xtatamiz. Asosiy himoya backendda qoladi.
        const required = permissionsForRequest(config.method, config.url)
        if (required) {
                try {
                        const userStore = useUserStore()
                        // Foydalanuvchi hali yuklanmagan bo'lsa tekshirmaymiz —
                        // qaror backendga qoladi (bootstrap paytidagi poyga).
                        if (userStore.user && !userStore.can(...required)) {
                                throw new PermissionDeniedError(
                                        config.method ?? 'get',
                                        config.url ?? '',
                                        required,
                                )
                        }
                } catch (error) {
                        if (isPermissionDeniedError(error)) throw error
                        // Pinia hali tayyor emas — tekshiruvsiz davom etamiz
                }
        }

        return config;
}, function (error) {
        return Promise.reject(error);
});

// responseType: 'blob' bo'lgan so'rovlarda (masalan, Excel eksporti) xato body'si ham
// Blob bo'lib keladi — undagi JSON matnni ochib beramiz, aks holda xabar yo'qoladi.
const normalizeBlobError = async (error: AxiosError): Promise<void> => {
        const data = error.response?.data
        if (!(data instanceof Blob)) return

        try {
                error.response!.data = JSON.parse(await data.text())
        } catch {
                // JSON emas (yoki o'qib bo'lmadi) — status bo'yicha umumiy matn ishlatiladi
                error.response!.data = undefined
        }
}

// Backend javobidan foydalanuvchiga ko'rsatiladigan xato matnini ajratib olamiz
const extractErrorMessage = (error: AxiosError): string => {
        const t = i18n.global.t

        // Server umuman javob bermadi (tarmoq xatosi, timeout)
        if (!error.response) {
                return t('common.errors.network')
        }

        const data = error.response.data as unknown

        if (typeof data === 'string' && data.trim()) return data

        if (data && typeof data === 'object') {
                const obj = data as Record<string, unknown>

                if (typeof obj.message === 'string' && obj.message.trim()) return obj.message
                if (Array.isArray(obj.message) && obj.message.length) return obj.message.join(', ')
                if (typeof obj.error === 'string' && obj.error.trim()) return obj.error

                // Validatsiya xatolari: { errors: { field: ['msg'] | 'msg' } }
                if (obj.errors && typeof obj.errors === 'object') {
                        const first = Object.values(obj.errors as Record<string, unknown>)
                                .flat()
                                .find((v) => typeof v === 'string' && v.trim())
                        if (typeof first === 'string') return first
                }
        }

        // Status bo'yicha umumiy matn
        const status = error.response.status
        if (status >= 500) return t('common.errors.server')
        if (status === 403) return t('common.errors.forbidden')
        return t('common.errors.unknown')
}

http.interceptors.response.use(function (response) {
        return response;
}, async function (error: AxiosError) {
        // Ruxsat yo'qligi sababli biz to'xtatgan so'rov — foydalanuvchiga xabar
        // ko'rsatilmaydi, chunki UI'da bu blok allaqachon yashirilgan bo'lishi kerak.
        if (isPermissionDeniedError(error)) {
                if (import.meta.env.DEV) console.warn(`[permissions] ${(error as Error).message}`)
                return Promise.reject(error);
        }

        const status = error.response?.status

        if (status === 401) {
                localStorage.removeItem('token');
                router.push('/login')
                return Promise.reject(error);
        }

        await normalizeBlobError(error)

        try {
                const notify = useNotificationStore()
                notify.error(extractErrorMessage(error))
        } catch {
                // Pinia hali tayyor bo'lmasa, jim o'tkazamiz
        }

        return Promise.reject(error);
});


export default http
