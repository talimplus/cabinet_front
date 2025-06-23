import http from '../baseHttp';
import type { SubjectsParams, SubjectForm } from '@/types/subject.types.ts'
export const fetchSubjects = async (params: SubjectsParams) => {
        return await http.get(`/subjects`, {
                params,
        })
}

export const createSubjects = async (form: SubjectForm) => {
        return await http.post('/subjects', form)
}

export const editSubject = async (form: SubjectForm, id: number) => {
        return await http.put(`/subjects/${id}`, form)
}

export const deleteSubject = async (id: number) => {
        return await http.delete(`/subjects/${id}`)
}