import { ref } from 'vue'
import { defineStore } from 'pinia'

export type NotifyColor = 'success' | 'error' | 'warning' | 'info'

export interface AppNotification {
  id: number
  message: string
  color: NotifyColor
  timeout: number
}

/**
 * Global bildirishnomalar (snackbar) navbati.
 * Vue komponentidan tashqarida ham (masalan, axios interceptor) chaqirilishi mumkin.
 */
export const useNotificationStore = defineStore('notification', () => {
  const queue = ref<AppNotification[]>([])
  let seq = 0

  function notify(message: string, color: NotifyColor = 'info', timeout = 4000) {
    const text = message?.trim()
    if (!text) return
    // Bir xil xabar ketma-ket kelsa, takrorlamaymiz
    const last = queue.value[queue.value.length - 1]
    if (last && last.message === text && last.color === color) return
    queue.value.push({ id: ++seq, message: text, color, timeout })
  }

  const success = (message: string, timeout = 3000) => notify(message, 'success', timeout)
  const error = (message: string, timeout = 5000) => notify(message, 'error', timeout)
  const warning = (message: string, timeout = 4000) => notify(message, 'warning', timeout)
  const info = (message: string, timeout = 4000) => notify(message, 'info', timeout)

  function remove(id: number) {
    queue.value = queue.value.filter((n) => n.id !== id)
  }

  return { queue, notify, success, error, warning, info, remove }
})
