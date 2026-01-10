export interface Center {
        id: number
        name: string
        createdAt: string
        isDefault?: boolean
}

export interface CenterForm {
        name: string
        isDefault?: boolean
}

export interface CentersParams {
        name?: string
        page?: number
        perPage?: number
}