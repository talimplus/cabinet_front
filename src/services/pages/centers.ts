import http from '../baseHttp';
import type { CenterForm } from '@/types/center.types';


export const fetchCenters = async () => {
        return await http.get('/centers')
}

export const createCenter = async (form: CenterForm) => {
        return await http.post('/centers', form)
}

export const editCenter = async (form: CenterForm, id: number) => {
        return await http.put(`/centers/${id}`, form)
}

export const deleteCenter = async (id: number) => {
        return await http.delete(`/centers/${id}`)
}