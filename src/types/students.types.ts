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
}
export interface StudentForm {
        firstName: string;
        lastName: string;
        phone: string;
        birthDate: string;
        login: string;
        referrerId: number;
        monthlyFee: number;
        password: string,
        centerId: number,
        groupIds: number,
}
export interface StudentsParams {
        centerId?: number;
        name?: string;
        phone?: string;
        page?: number;
        perPage?: number
        status?: StudentStatus
}