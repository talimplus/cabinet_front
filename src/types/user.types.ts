export interface CurrentUser {
  id: number
  email: string
  role: string
  centerId: number
}

export interface LoginResponse {
  access_token: string
  user: CurrentUser
}

export interface MeResponse {
  user: CurrentUser
}

export interface UserProfile {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  password: string
  role: string
  centerId: number
  salary?: number
  commissionPercentage?: number
}

export interface UpdateProfileForm {
  firstName: string
  lastName: string
  login: string
  phone: string
  password?: string
}
