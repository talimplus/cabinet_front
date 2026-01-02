export interface Room {
    id: number
    name: string
}

export interface RoomForm {
    name?: string
    centerId?: number
}

export interface RoomParams {
    centerId: number
    name: string
}