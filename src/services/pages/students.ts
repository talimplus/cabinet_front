import http from "../baseHttp";
import type {
        StudentsParams,
        StudentForm,
        StudentDetail,
        TransferStudentsPayload,
        TransferPreviewPayload,
        TransferPreviewRow,
        TransferStudentsResponse,
} from "@/types/students.types";
import { StudentStatus } from "@/types/students.enum";
import type { AxiosResponse } from "axios";
export const fetchStudents = async (par?: StudentsParams) => {
        return await http.get('/students', { params: par })
}
export const fetchAllStudents = async (params?: StudentsParams) => {
        return await http.get('/students/all', { params })
}

export const fetchStudentById = async (id: number): Promise<AxiosResponse<StudentDetail>> => {
        return await http.get(`/students/${id}`)
}


export const createStudent = async (form: StudentForm) => {
        return await http.post('/students', form)
}

export const updateStudent = async (form: StudentForm, id: number) => {
        return await http.put(`/students/${id}`, form)
}

export const updateStudentStatus = async (
        status: StudentStatus,
        id: number,
        body?: { returnLikelihood?: string }
) => {
        return await http.put(`/students/change-status/${id}?status=${status}`, body || {})
}

export const deleteStudent = async (id: number) => {
        return await http.delete(`/students/${id}`)
}

export const previewTransferStudents = async (
        payload: TransferPreviewPayload
): Promise<AxiosResponse<TransferPreviewRow[]>> => {
        return await http.post('/students/transfer/preview', payload)
}

export const transferStudents = async (
        payload: TransferStudentsPayload
): Promise<AxiosResponse<TransferStudentsResponse>> => {
        return await http.post('/students/transfer', payload)
}
