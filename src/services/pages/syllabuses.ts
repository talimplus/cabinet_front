import http from '../baseHttp';
import type {
        SyllabusesParams,
        SyllabusForm,
        Syllabus,
        TopicForm,
        GenerateContentPayload,
        GeneratedTopicContent,
        GroupPlan,
        DistributePayload,
        TeacherToday,
        AiChatPayload,
        AiChatResponse,
        AiSavePayload,
} from '@/types/syllabus.types';

export const fetchSyllabuses = async (params?: SyllabusesParams) => {
        return await http.get('/syllabuses', { params })
}

export const fetchSyllabusById = async (id: number | string): Promise<Syllabus> => {
        const response = await http.get(`/syllabuses/${id}`)
        return response.data
}

export const createSyllabus = async (form: SyllabusForm) => {
        return await http.post('/syllabuses', form)
}

export const deleteSyllabus = async (id: number) => {
        return await http.delete(`/syllabuses/${id}`)
}

// AI plan builder
export const aiChat = async (payload: AiChatPayload): Promise<AiChatResponse> => {
        const response = await http.post('/syllabuses/ai/chat', payload)
        return response.data
}

export const aiSavePlan = async (payload: AiSavePayload): Promise<Syllabus> => {
        const response = await http.post('/syllabuses/ai/save', payload)
        return response.data
}

// Topics
export const createTopic = async (syllabusId: number | string, form: TopicForm) => {
        return await http.post(`/syllabuses/${syllabusId}/topics`, form)
}

export const updateTopic = async (syllabusId: number | string, topicId: number, form: TopicForm) => {
        return await http.put(`/syllabuses/${syllabusId}/topics/${topicId}`, form)
}

export const deleteTopic = async (syllabusId: number | string, topicId: number) => {
        return await http.delete(`/syllabuses/${syllabusId}/topics/${topicId}`)
}

export const reorderTopics = async (syllabusId: number | string, topicIds: number[]) => {
        return await http.put(`/syllabuses/${syllabusId}/topics/reorder`, { topicIds })
}

export const generateTopicContent = async (
        syllabusId: number | string,
        topicId: number,
        payload: GenerateContentPayload,
): Promise<GeneratedTopicContent> => {
        const response = await http.post(`/syllabuses/${syllabusId}/topics/${topicId}/generate-content`, payload)
        return response.data
}

// Group plan
export const fetchGroupPlan = async (groupId: number | string): Promise<GroupPlan> => {
        const response = await http.get(`/groups/${groupId}/plan`)
        return response.data
}

export const setGroupSyllabus = async (groupId: number | string, syllabusId: number | null) => {
        return await http.put(`/groups/${groupId}/plan/syllabus`, { syllabusId })
}

export const setLessonTopics = async (
        groupId: number | string,
        lessonNumber: number,
        topicIds: number[],
) => {
        return await http.put(`/groups/${groupId}/plan/lessons/${lessonNumber}/topics`, { topicIds })
}

export const distributePlan = async (
        groupId: number | string,
        payload: DistributePayload,
): Promise<GroupPlan> => {
        const response = await http.post(`/groups/${groupId}/plan/distribute`, payload)
        return response.data
}

// Teacher today
export const fetchTeacherToday = async (): Promise<TeacherToday> => {
        const response = await http.get('/teachers/me/today')
        return response.data
}
