export interface Center {
        id: number
        name: string
        createdAt: string
}

export interface CenterForm {
        name: string
}

export interface CentersParams {
        name?: string
        page?: number
        perPage?: number
}