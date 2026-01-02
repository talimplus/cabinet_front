import http from "../baseHttp";
import type { GroupForm } from "@/types/group.types";

export const fetchGroups = async () => {
        return await http.get('/groups')
}

export const fetchAllGroups = async () => {
        return await http.get('/groups/all')
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