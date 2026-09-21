export interface Center {
        id: number
        name: string
        createdAt: string
        isDefault?: boolean
        /** "Bugun" va ish kuni shu zonada hisoblanadi */
        timezone?: string
        // ── Xodim davomati sozlamalari ──────────────────────────
        latitude?: number | null
        longitude?: number | null
        /** Shu radius (metr) ichidan bosilgan "Keldim" joylashuv bo'yicha to'g'ri hisoblanadi */
        checkInRadiusMeters?: number
        /** Markaz Wi-Fi'sining tashqi IP manzili */
        publicIp?: string | null
}

export interface CenterForm {
        name: string
        isDefault?: boolean
        latitude?: number | null
        longitude?: number | null
        checkInRadiusMeters?: number
        publicIp?: string | null
}

export interface CentersParams {
        name?: string
        page?: number
        perPage?: number
}
