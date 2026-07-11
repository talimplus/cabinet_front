import type { Subject } from '@/types/subject.types.ts'
import type { GroupStatus } from '@/types/groups.enum'

export type TopicDifficulty = 'easy' | 'medium' | 'hard'

export interface SyllabusTopic {
        id: number;
        orderIndex: number;
        title: string;
        description: string | null;
        difficulty: TopicDifficulty | null;
        estimatedLessons: number | null;
        guide: string | null;
        lessonOutline: string | null;
        homework: string | null;
}

export interface SyllabusListItem {
        id: number;
        name: string;
        description: string | null;
        subject: Pick<Subject, 'id' | 'name'>;
        topicsCount: number;
        createdAt: string;
}

export interface Syllabus {
        id: number;
        name: string;
        description: string | null;
        subject: Pick<Subject, 'id' | 'name'>;
        topics: SyllabusTopic[];
}

export interface SyllabusesParams {
        subjectId?: number;
        name?: string;
        page?: number;
        perPage?: number;
}

export interface SyllabusForm {
        name: string;
        description?: string;
        subjectId?: number;
}

export interface TopicForm {
        title?: string;
        description?: string;
        difficulty?: TopicDifficulty;
        estimatedLessons?: number;
        guide?: string;
        lessonOutline?: string;
        homework?: string;
}

export interface GenerateContentPayload {
        audience?: string;
        instructions?: string;
}

export interface GeneratedTopicContent {
        guide: string | null;
        lessonOutline: string | null;
        homework: string | null;
}

// ---- AI chat plan builder ---------------------------------------------

export interface AiChatMessage {
        role: 'user' | 'assistant';
        content: string;
}

export interface AiPlanTopic {
        title: string;
        description?: string | null;
        difficulty: TopicDifficulty;
        estimatedLessons: number;
}

export interface AiPlan {
        name: string;
        description?: string | null;
        totalLessons?: number | null;
        topics: AiPlanTopic[];
}

export interface AiChatPayload {
        subjectId?: number;
        messages: AiChatMessage[];
}

export interface AiChatQuestionResponse {
        type: 'question';
        message: string;
}

export interface AiChatPlanResponse {
        type: 'plan';
        message: string;
        plan: AiPlan;
}

export type AiChatResponse = AiChatQuestionResponse | AiChatPlanResponse;

export interface AiSavePayload {
        subjectId: number;
        name: string;
        description?: string;
        topics: AiPlanTopic[];
}

// ---- Group plan -------------------------------------------------------

export interface PlanTopic extends SyllabusTopic {
        isAssigned?: boolean;
}

export interface PlanLesson {
        lessonNumber: number;
        date: string | null;
        isPast: boolean;
        isToday: boolean;
        topics: PlanTopic[];
}

export interface GroupPlan {
        group: {
                id: number;
                name: string;
                status: GroupStatus;
                startDate: string | null;
                endDate: string | null;
                durationMonths: number | null;
                subject: Pick<Subject, 'id' | 'name'> | null;
        };
        syllabus: {
                id: number;
                name: string;
                description: string | null;
                topics: PlanTopic[];
        } | null;
        timezone: string;
        today: string;
        totalLessons: number | null;
        horizonDate: string | null;
        lessons: PlanLesson[];
}

export interface DistributePayload {
        totalLessons?: number;
        instructions?: string;
}

// ---- Teacher today ----------------------------------------------------

export interface TodayLesson {
        group: {
                id: number;
                name: string;
                status: GroupStatus;
                subject: Pick<Subject, 'id' | 'name'> | null;
                room: { id: number; name: string } | null;
        };
        date: string;
        startTime: string | null;
        lessonNumber: number;
        hasSyllabus: boolean;
        topics: SyllabusTopic[];
        previousTopics: SyllabusTopic[];
}

export interface TeacherToday {
        date: string;
        lessons: TodayLesson[];
}
