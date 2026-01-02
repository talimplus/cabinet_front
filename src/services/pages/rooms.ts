import http from '../baseHttp';
import type { RoomForm, RoomParams } from '@/types/room.types';

export const fetchRooms = async (params?: RoomParams) => {
    return await http.get('/rooms', { params, })
}

export const createRoom = async (form: RoomForm) => {
    return await http.post('/rooms', form)
}

export const updateRoom = async (form: RoomForm, id: number) => {
    return await http.put(`/rooms/${id}`, form)
}

export const deleteRoom = async (id: number) => {
    return await http.delete(`/rooms/${id}`)
}