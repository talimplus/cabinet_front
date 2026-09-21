import type { Center } from '@/types/centers.types.ts'
import type { Teacher } from '@/types/teacher.types.ts'
import type { Subject } from '@/types/subject.types.ts'
import type { Room } from '@/types/rooms.types.ts'
import { WeekDay, GroupStatus } from '@/types/groups.enum'


export interface GroupSchedule {
        id: number;
        day: WeekDay;
        startTime: string;
}

export interface Group {
        id: number;
        name: string;
        /** JORIY oyda amal qilayotgan narx. Narx o'zgartirilsa u keyingi oydan kuchga kiradi. */
        monthlyFee: number | null;
        /** Keyingi oydan kuchga kiradigan narx (reja bo'lmasa null). */
        upcomingMonthlyFee?: number | null;
        /** `upcomingMonthlyFee` kuchga kiradigan oy: YYYY-MM-01. */
        upcomingFeeFromMonth?: string | null;
        createdAt: string;
        center: Center;
        subject: Subject;
        teacher: Teacher | null;
        room?: Room | null;
        status?: GroupStatus;
        statusLoading?: boolean;
        schedules?: GroupSchedule[];
        startDate?: string;
        endDate?: string | null;
        /** Bitta darsning davomiyligi (daqiqa). Xona/o'qituvchi bandligi shu bo'yicha. */
        lessonDurationMinutes?: number;
}
export interface GroupFormDays {
        day: WeekDay,
        startTime: string
}
export interface GroupForm {
        name?: string,
        subjectId?: number,
        teacherId?: number,
        roomId?: number,
        monthlyFee?: number | null,
        /**
         * Yangi narx qachondan kuchga kirsin.
         * Yuborilmasa — `next_month` (keyingi oydan).
         * `current_month` faqat xato kiritilgan narxni tuzatish uchun.
         */
        applyFeeFrom?: 'next_month' | 'current_month',
        // Darslar boshlanish/tugash sanalari: YYYY-MM-DD.
        // endDate ixtiyoriy; null yuborilsa muddat olib tashlanadi (guruh "muddatsiz" bo'ladi).
        startDate?: string | null,
        endDate?: string | null,
        /** Bitta darsning davomiyligi (daqiqa, default 90) */
        lessonDurationMinutes?: number,
        days?: GroupFormDays[],
        centerId?: number
}

export interface GroupsParams {
        centerId?: number;
        teacherId?: number;
        page?: number;
        perPage?: number;
}
