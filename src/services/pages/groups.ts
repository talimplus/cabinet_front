import http from "../baseHttp";
import type { GroupForm } from "@/types/groups.types";
import type { LessonDatesResponse, LessonDatesParams, SubmitAttendancePayload } from "@/types/attendance.types";

export const fetchGroups = async () => {
        return await http.get('/groups')
}

export const fetchAllGroups = async () => {
        return await http.get('/groups/all')
}

export const fetchGroupById = async (id: number | string) => {
        return await http.get(`/groups/${id}`)
}

export const createGroup = async (form: GroupForm) => {
        return await http.post('/groups', form)
}

export const deleteGroup = async (id: number) => {
        return await http.delete(`/groups/${id}`)
}

export const updateGroup = async (form: GroupForm, id: number) => {
        return await http.put(`/groups/${id}`, form)
}

// Attendance APIs
export const fetchLessonDates = async (groupId: number | string, params?: LessonDatesParams): Promise<LessonDatesResponse> => {
        const response = await http.get(`/groups/${groupId}/attendance/lesson-dates`, { params })
        return response.data
}

export const submitAttendance = async (groupId: number | string, payload: SubmitAttendancePayload) => {
        return await http.post(`/groups/${groupId}/attendance/submit`, payload)
}