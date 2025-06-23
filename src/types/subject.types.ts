import type { Center } from "./centers.types";

export interface Subject {
        id: number;
        name: string;
        createdAt: string;
        center: Center
}

export interface SubjectsParams {
        centerId?: number;
        name?: string;
        page?: number
        perPage?: number
}

export interface SubjectForm {
        name: string,
        centerId?: number
}