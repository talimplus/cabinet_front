import http from '../baseHttp';
import type { CenterForm, CentersParams } from '@/types/center.types';


export const fetchCenters = async (par: CentersParams) => {
        return await http.get('/centers', { params: par })
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