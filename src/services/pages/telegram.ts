import http from '../baseHttp'
import type {
  TelegramSettings,
  TelegramSettingsForm,
  TelegramStudentLink,
} from '@/types/telegram.types'

export const fetchStudentTelegramLink = async (studentId: number) => {
  const { data } = await http.get<TelegramStudentLink>(
    `/telegram/students/${studentId}/link`,
  )
  return data
}

export const regenerateStudentTelegramQr = async (studentId: number) => {
  const { data } = await http.post<TelegramStudentLink>(
    `/telegram/students/${studentId}/link/regenerate`,
  )
  return data
}

export const unlinkTelegramParent = async (linkId: number) => {
  const { data } = await http.delete<{ success: boolean }>(
    `/telegram/parents/${linkId}`,
  )
  return data
}

export const fetchTelegramSettings = async () => {
  const { data } = await http.get<TelegramSettings>('/telegram/settings')
  return data
}

export const updateTelegramSettings = async (payload: TelegramSettingsForm) => {
  const { data } = await http.put<TelegramSettings>('/telegram/settings', payload)
  return data
}

/** Token backendda getMe() bilan tekshiriladi, username avtomatik olinadi */
export const setTelegramBotToken = async (botToken: string) => {
  const { data } = await http.put<TelegramSettings>('/telegram/bot-token', {
    botToken,
  })
  return data
}

export const removeTelegramBotToken = async () => {
  const { data } = await http.delete<TelegramSettings>('/telegram/bot-token')
  return data
}

export const sendTelegramDebtReminders = async () => {
  const { data } = await http.post<{ students: number }>(
    '/telegram/debt-reminders/send-now',
  )
  return data
}
