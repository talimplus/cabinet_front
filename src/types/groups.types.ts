import type { Center } from '@/types/centers.types.ts'
import type { Teacher } from '@/types/teacher.types.ts'
import type { Subject } from '@/types/subject.types.ts'



export interface Group {
        id: number;
        name: string;
        monthlyFee: number | null;
        createdAt: string;
        centers: Center;
        subject: Subject;
        teacher: Teacher;
}
