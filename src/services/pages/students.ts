import http from "../baseHttp";
import type { StudentsParams } from "@/types/students.types";
export const fetchStudents = async (par?: StudentsParams) => {
        return await http.get('/students', { params: par })
}