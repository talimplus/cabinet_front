import { StudentStatus } from "./students.enum";
export interface Student {
        id: number;
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
        monthlyFee: number;
        discountPercent?: number | string;
        discountReason?: string | null;
        discountPeriods?: DiscountPeriod[];
        status: StudentStatus;
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
        birthDate: string;
        referrerId: number;
        monthlyFee: number;
        centerId: number,
        groupIds: number[],
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