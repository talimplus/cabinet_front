import type { GroupStatus, WeekDay } from '@/types/groups.enum'

/** Jadval panjarasidagi bitta dars (backend `GET /group-schedule/board`). */
export interface ScheduleLesson {
	groupId: number
	groupName: string
	groupStatus: GroupStatus
	day: WeekDay
	/** 'HH:mm' */
	startTime: string
	/** 'HH:mm' — startTime + durationMinutes */
	endTime: string
	durationMinutes: number
	roomId: number | null
	roomName: string | null
	teacherId: number | null
	teacherName: string | null
	subjectId: number | null
	subjectName: string | null
}

export interface ScheduleRoom {
	id: number
	name: string
}

export interface ScheduleBoard {
	rooms: ScheduleRoom[]
	lessons: ScheduleLesson[]
}

/**
 * Xona/o'qituvchi bandligi. Xabar frontda yig'iladi (tarjima uchun),
 * backend faqat faktlarni qaytaradi.
 */
export interface ScheduleConflict {
	reason: 'room' | 'teacher'
	day: WeekDay
	/** Tekshirilayotgan (yangi) dars vaqti */
	requestedStartTime: string
	requestedEndTime: string
	/** Band qilib turgan guruh */
	groupId: number
	groupName: string
	startTime: string
	endTime: string
	roomId: number | null
	roomName: string | null
	teacherId: number | null
	teacherName: string | null
}

export interface ScheduleConflictPayload {
	days: { day: WeekDay; startTime: string }[]
	roomId?: number
	teacherId?: number
	lessonDurationMinutes?: number
	excludeGroupId?: number
}
