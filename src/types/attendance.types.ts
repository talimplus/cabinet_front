// present = keldi, absent = kelmadi (sababsiz), late = kechikdi, excused = sababli (uzrли)
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface AttendanceItem {
  studentId: number
  status: AttendanceStatus
  comment?: string
}

export interface AttendanceByDate {
  exists: boolean
  rows?: AttendanceItem[]
  items?: AttendanceItem[] // Legacy support
}

export interface LessonDateOverride {
  type: 'cancelled' | 'extra'
  reason?: string
}

// GET /groups/:id/attendance/lesson-dates javobidagi guruh o'quvchisi.
// joinedAt — o'quvchi SHU guruhga qo'shilgan sana (guruh timezone'ida, YYYY-MM-DD).
// To'lov proratsiyasi ham aynan shu sanadan boshlanadi, shuning uchun davomat
// chegarasi to'lov bilan bir xil bo'ladi. null — sana noma'lum, cheklov yo'q.
export interface GroupStudent {
  id: number
  firstName: string
  lastName: string
  joinedAt: string | null
  // leftAt — o'quvchi shu guruhdan chiqqan sana, **exclusive**: o'sha kungi
  // darsga ham davomat yozilmaydi va to'lov hisoblanmaydi. Boshqa guruhga
  // ko'chirilgan o'quvchi jurnalda shu sanagacha ko'rinib turadi (tarix uchun).
  leftAt?: string | null
}

export interface LessonDatesResponse {
  timezone: string
  today: string
  // Eski backend bu maydonni qaytarmasligi mumkin — u holda cheklov qo'llanmaydi
  students?: GroupStudent[]
  lessonDates: string[]
  attendanceByDate: Record<string, AttendanceByDate>
  overridesByDate?: Record<string, LessonDateOverride>
}

export interface SubmitAttendancePayload {
  lessonDate: string
  items: AttendanceItem[]
}

export interface LessonDatesParams {
  mode?: 'last' | 'range'
  count?: number
  from?: string
  to?: string
}

export interface RescheduleAttendancePayload {
  toDate: string
  reason?: string
}
