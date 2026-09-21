/**
 * Axios xatosidan foydalanuvchiga ko'rsatiladigan xabarni oladi.
 *
 * Backend ikki xil format qaytaradi:
 *  - 400 va boshqa biznes xatolari → `{ message }`
 *  - 422 (validatsiya)            → `{ errors: { field: msg } }`
 */
interface ApiErrorShape {
  response?: {
    data?: {
      message?: string | string[]
      errors?: Record<string, string>
    }
  }
}

/** Snackbar uchun matn. Topilmasa `undefined` — chaqiruvchi o'z matnini beradi. */
export const apiErrorMessage = (error: unknown): string | undefined => {
  const message = (error as ApiErrorShape)?.response?.data?.message
  if (Array.isArray(message)) return message[0]
  return message || undefined
}

/** Formaga `setErrors(...)` bilan berish uchun maydon xatolari. */
export const apiFieldErrors = (
  error: unknown,
): Record<string, string> | undefined =>
  (error as ApiErrorShape)?.response?.data?.errors
