import http from "../baseHttp";
import type { StudentsParams, StudentForm } from "@/types/students.types";
import { StudentStatus } from "@/types/students.enum";
export const fetchStudents = async (par?: StudentsParams) => {
        return await http.get('/students', { params: par })
}
export const fetchAllStudents = async () => {
        return await http.get('/students/all')
}


export const createStudent = async (form: StudentForm) => {
        return await http.post('/students', form)
}

export const updateStudent = async (form: StudentForm, id: number) => {
        return await http.put(`/students/${id}`, form)
}

export const updateStudentStatus = async (status: StudentStatus, id: number) => {
        return await http.put(`/students/change-status/${id}?status=${status}`)
}