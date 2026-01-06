import { StudentStatus } from "./students.enum";
export interface Student {
        id: number;
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
        monthlyFee: number;
        referralDiscount: number;
        status: StudentStatus;
        openStatus?: boolean,
        statusLoading?: boolean
        createdAt?: string;
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