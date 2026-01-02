import type { Center } from '@/types/centers.types.ts'
import type { Teacher } from '@/types/teacher.types.ts'
import type { Subject } from '@/types/subject.types.ts'
import { WeekDay } from '@/types/groups.enum'


export interface Group {
        id: number;
        name: string;
        monthlyFee: number | null;
        createdAt: string;
        centers: Center;
        subject: Subject;
        teacher: Teacher;
}
export interface GroupFormDays {
        day: WeekDay,
        startTime: string
}
export interface GroupForm {
        name?: string,
        subjectId?: number,
        teacherId?: number,
        monthlyFee?: number,
        days?: GroupFormDays[],
        centerId?: number
}