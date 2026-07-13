import router from '@/router/index';
import axios, { type AxiosError } from 'axios';
import i18n from '@/plugins/i18n';
import { useNotificationStore } from '@/stores/notification';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

http.interceptors.request.use(function (config) {
        const token = localStorage.getItem('token');

        if (token) config.headers.Authorization = `Bearer ${token}`
        return config;
}, function (error) {
        return Promise.reject(error);
});

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
}, function (error: AxiosError) {
        const status = error.response?.status

        if (status === 401) {
                localStorage.removeItem('token');
                router.push('/login')
                return Promise.reject(error);
        }

        try {
                const notify = useNotificationStore()
                notify.error(extractErrorMessage(error))
        } catch {
                // Pinia hali tayyor bo'lmasa, jim o'tkazamiz
        }

        return Promise.reject(error);
});


export default http
