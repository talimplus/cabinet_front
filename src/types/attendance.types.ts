export type AttendanceStatus = 'present' | 'absent'

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

export interface LessonDatesResponse {
  timezone: string
  today: string
  lessonDates: string[]
  attendanceByDate: Record<string, AttendanceByDate>
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
