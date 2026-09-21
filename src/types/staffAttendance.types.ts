/** Yozuv qayerdan paydo bo'ldi */
export type AttendanceSource = 'self' | 'reception' | 'manual'

/**
 * Yozuvga qanchalik ishonish mumkin. Hech narsani bloklamaydi —
 * faqat hisobotda ajratib ko'rsatiladi.
 */
export type AttendanceConfidence = 'high' | 'medium' | 'low'

/** `staffAttendance.flags.*` tarjima kalitlariga mos keladi */
export type AttendanceFlag =
  | 'no_geo'
  | 'low_gps_accuracy'
  | 'far_from_center'
  | 'ip_mismatch'
  | 'center_not_configured'
  | 'shared_device'
  | 'no_lesson_today'

export interface AttendanceUser {
  id: number
  firstName: string
  lastName: string
  role: string
}

export interface StaffAttendance {
  id: number
  user: AttendanceUser | null
  userId: number
  centerId: number | null
  /** YYYY-MM-DD */
  workDate: string
  checkInAt: string
  /** Shu kundagi birinchi dars vaqti (HH:mm:ss). Darsi bo'lmasa null */
  firstLessonAt: string | null
  lateMinutes: number
  source: AttendanceSource
  confidence: AttendanceConfidence
  distanceMeters: number | null
  geoMatched: boolean | null
  ipMatched: boolean | null
  flags: AttendanceFlag[]
  confirmedByUserId: number | null
  confirmedAt: string | null
  note: string | null
}

export interface CheckInPayload {
  latitude?: number
  longitude?: number
  accuracyMeters?: number
  deviceId?: string
}

export interface CheckInResult {
  /** Bugun allaqachon belgilangan edi — yangi yozuv yaratilmadi */
  alreadyCheckedIn: boolean
  attendance: StaffAttendance
}

export interface StaffAttendanceToday {
  date: string
  checkedIn: boolean
  attendance: StaffAttendance | null
  firstLessonAt: string | null
  lessonsToday: number
  /** Markazga joylashuv yoki IP kiritilganmi (aks holda tekshiruv ishlamaydi) */
  centerConfigured: boolean
}

export interface StaffAttendanceParams {
  page?: number
  perPage?: number
  centerId?: number
  userId?: number
  from?: string
  to?: string
  confidence?: AttendanceConfidence
  onlyFlagged?: boolean
  onlyLate?: boolean
}

export interface ManualCheckInForm {
  userId: number | null
  workDate: string
  /** HH:mm */
  checkInTime: string
  note?: string
}

export interface StaffAttendanceReportRow {
  user: AttendanceUser
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
}

export interface StaffAttendanceReport {
  from: string
  to: string
  centerNotConfigured: boolean
  rows: StaffAttendanceReportRow[]
}
