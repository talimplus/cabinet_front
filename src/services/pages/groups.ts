import http from "../baseHttp";
import type { GroupForm, GroupsParams } from "@/types/groups.types";
import type { LessonDatesResponse, LessonDatesParams, SubmitAttendancePayload } from "@/types/attendance.types";

export const fetchGroups = async (params?: GroupsParams) => {
        return await http.get('/groups', { params })
}

export const fetchAllGroups = async (centerId?: number) => {
        const params = centerId ? { centerId } : undefined
        return await http.get('/groups/all', { params })
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

export const changeGroupStatus = async (id: number, status: string) => {
        return await http.put(`/groups/change-status/${id}`, { status })
}

// Attendance APIs
export const fetchLessonDates = async (groupId: number | string, params?: LessonDatesParams): Promise<LessonDatesResponse> => {
        const response = await http.get(`/groups/${groupId}/attendance/lesson-dates`, { params })
        return response.data
}

export const submitAttendance = async (groupId: number | string, payload: SubmitAttendancePayload) => {
        return await http.post(`/groups/${groupId}/attendance/submit`, payload)
}