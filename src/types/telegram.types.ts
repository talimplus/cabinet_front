/** Ota-onalar uchun Telegram bot — API modellari */

export interface TelegramParent {
  id: number
  firstName: string | null
  lastName: string | null
  username: string | null
  isActive: boolean
  linkedAt: string
  unlinkedAt: string | null
  blockedAt: string | null
  lastNotifiedAt: string | null
}

export interface TelegramStudentLink {
  studentId: number
  botUsername: string | null
  /** `TELEGRAM_BOT_TOKEN` serverda sozlanganmi — yo'q bo'lsa QR yaratilmaydi */
  botConfigured: boolean
  deepLink: string | null
  /** QR kod — PNG data URL */
  qrDataUrl: string | null
  parents: TelegramParent[]
}

export interface TelegramSettings {
  id: number
  organizationId: number
  isEnabled: boolean
  notifyPaymentReceived: boolean
  notifyPaymentConfirmed: boolean
  notifyAbsence: boolean
  notifyDebt: boolean
  debtReminderDay: number
  /** Tashkilotning bot tokeni saqlanganmi (qiymatning o'zi qaytarilmaydi) */
  botConfigured: boolean
  /** Bot hozir Telegram bilan ulangan holatdami */
  botConnected: boolean
  botUsername: string | null
  botTokenMasked: string | null
  botTokenUpdatedAt: string | null
}

export type TelegramSettingsForm = Partial<
  Pick<
    TelegramSettings,
    | 'isEnabled'
    | 'notifyPaymentReceived'
    | 'notifyPaymentConfirmed'
    | 'notifyAbsence'
    | 'notifyDebt'
    | 'debtReminderDay'
  >
>
