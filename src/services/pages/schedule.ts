import http from '../baseHttp'
import type {
  ScheduleBoard,
  ScheduleConflict,
  ScheduleConflictPayload,
} from '@/types/schedule.types'

/**
 * Butun haftalik jadval. `centerId` ni `baseHttp` aktiv filialdan avtomatik
 * qo'shadi — bu yerda qo'lda yuborilmaydi.
 */
export const fetchScheduleBoard = async (): Promise<ScheduleBoard> => {
  const response = await http.get('/group-schedule/board')
  return response.data
}

/** Guruh saqlanmasdan turib xona/o'qituvchi bandligini tekshirish. */
export const checkScheduleConflicts = async (
  payload: ScheduleConflictPayload,
): Promise<ScheduleConflict[]> => {
  const response = await http.post('/group-schedule/conflicts', payload)
  return response.data
}
