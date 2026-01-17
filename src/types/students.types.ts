import { StudentStatus } from "./students.enum";
export interface Student {
        id: number;
        firstName: string;
        lastName: string;
        phone: string;
        secondPhone?: string | null;
        birthDate: string;
        monthlyFee: number;
        comment?: string | null;
        heardAboutUs?: string | null;
        preferredTime?: 'morning' | 'evening' | string | null;
        preferredDays?: string[] | null;
        passportSeries?: string | null;
        passportNumber?: string | null;
        jshshir?: string | null;
        discountPercent?: number | string;
        discountReason?: string | null;
        discountPeriods?: DiscountPeriod[];
        status: StudentStatus;
        groupIds?: number[];
        openStatus?: boolean,
        statusLoading?: boolean
        createdAt?: string;
        activatedAt?: string;
        stoppedAt?: string | null;
}
export interface DiscountPeriod {
  percent: number;
  fromMonth: string;
  toMonth: string;
  reason: string;
}

export interface StudentForm {
        firstName: string;
        lastName: string;
        phone: string;
        secondPhone?: string;
        birthDate: string;
        referrerId?: number;
        monthlyFee?: number;
        comment?: string;
        heardAboutUs?: string;
        preferredTime?: 'morning' | 'evening' | string;
        preferredDays?: string[];
        passportSeries?: string;
        passportNumber?: string;
        jshshir?: string;
        centerId?: number,
        groupIds?: number[],
        discountPercent?: number;
        discountReason?: string;
        discountPeriods?: DiscountPeriod[];
}
export interface StudentsParams {
        centerId?: number;
        name?: string;
        phone?: string;
        page?: number;
        perPage?: number
        status?: StudentStatus
        groupId?: number;
}