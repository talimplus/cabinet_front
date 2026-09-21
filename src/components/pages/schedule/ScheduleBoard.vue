<template>
  <div>
    <!-- Kun tanlash -->
    <div class="d-flex align-center flex-wrap mb-4" style="gap: 12px">
      <v-btn-toggle v-model="selectedDay" mandatory density="comfortable" color="primary" divided>
        <v-btn v-for="day in dayList" :key="day" :value="day" size="small">
          {{ $t(`schedule.daysShort.${day}`) }}
        </v-btn>
      </v-btn-toggle>

      <v-spacer></v-spacer>

      <v-btn
        icon="mdi-refresh"
        variant="text"
        color="medium-emphasis"
        :loading="loading"
        @click="load"
      ></v-btn>
    </div>

    <div v-if="loading && !board" class="text-center pa-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Xona umuman yo'q -->
    <v-alert
      v-else-if="board && columns.length === 0"
      type="info"
      variant="tonal"
      density="compact"
      :text="$t('schedule.noRooms')"
    ></v-alert>

    <template v-else-if="board">
      <v-alert
        v-if="dayLessons.length === 0"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-4"
        :text="$t('schedule.noLessonsThisDay')"
      ></v-alert>

      <div class="board-scroll">
        <div class="board" :style="{ gridTemplateColumns: `72px repeat(${columns.length}, minmax(150px, 1fr))` }">
          <!-- Sarlavha qatori -->
          <div class="board-corner"></div>
          <div
            v-for="column in columns"
            :key="`head-${column.key}`"
            class="board-head"
            :class="{ 'board-head--active': column.id !== null && column.id === highlightRoomId }"
          >
            {{ column.name }}
          </div>

          <!-- Vaqt ustuni -->
          <div class="board-times" :style="{ height: `${gridHeight}px` }">
            <div
              v-for="mark in hourMarks"
              :key="`time-${mark}`"
              class="board-time"
              :style="{ top: `${(mark - gridStart) * PX_PER_MINUTE}px` }"
            >
              {{ minutesToLabel(mark) }}
            </div>
          </div>

          <!-- Xona ustunlari -->
          <div
            v-for="column in columns"
            :key="`col-${column.key}`"
            class="board-column"
            :class="{ 'board-column--active': column.id !== null && column.id === highlightRoomId }"
            :style="{ height: `${gridHeight}px` }"
          >
            <div
              v-for="mark in hourMarks"
              :key="`line-${column.key}-${mark}`"
              class="board-line"
              :style="{ top: `${(mark - gridStart) * PX_PER_MINUTE}px` }"
            ></div>

            <div
              v-for="item in column.items"
              :key="`lesson-${item.lesson.groupId}-${item.lesson.startTime}`"
              class="board-lesson"
              :class="{ 'board-lesson--overlap': item.overlapping }"
              :style="{
                top: `${(item.start - gridStart) * PX_PER_MINUTE}px`,
                height: `${Math.max(item.end - item.start, 30) * PX_PER_MINUTE - 4}px`,
                left: `calc(${(item.lane / item.lanes) * 100}% + 2px)`,
                width: `calc(${100 / item.lanes}% - 4px)`,
              }"
            >
              <div class="board-lesson-time">
                {{ item.lesson.startTime }}–{{ item.lesson.endTime }}
              </div>
              <div class="board-lesson-name">{{ item.lesson.groupName }}</div>
              <div v-if="item.lesson.teacherName" class="board-lesson-meta">
                {{ item.lesson.teacherName }}
              </div>
              <div v-if="item.lesson.subjectName" class="board-lesson-meta">
                {{ item.lesson.subjectName }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchScheduleBoard } from '@/services/pages/schedule'
import { WeekDay } from '@/types/groups.enum'
import type { ScheduleBoard, ScheduleLesson } from '@/types/schedule.types'
import { useNotificationStore } from '@/stores/notification'
import { apiErrorMessage } from '@/services/apiError'

defineOptions({ name: 'ScheduleBoard' })

interface Props {
  /** Modaldan ochilganda tanlangan xona ajratib ko'rsatiladi */
  highlightRoomId?: number | null
  /** Modaldan ochilganda birinchi bo'lib shu kun ko'rsatiladi */
  initialDay?: WeekDay | null
}

const props = defineProps<Props>()

const { t } = useI18n()
const notify = useNotificationStore()

/** 1 daqiqa = necha piksel. 90 daqiqalik dars ≈ 108px. */
const PX_PER_MINUTE = 1.2
/** Jadval hech bo'lmaganda shu oraliqni ko'rsatadi */
const FALLBACK_START = 8 * 60
const FALLBACK_END = 20 * 60

const dayList: WeekDay[] = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
  WeekDay.SUNDAY,
]

/** JS `getDay()` (0 — yakshanba) -> WeekDay */
const todayWeekDay = (): WeekDay => dayList[(new Date().getDay() + 6) % 7]

const board = ref<ScheduleBoard | null>(null)
const loading = ref(false)
const selectedDay = ref<WeekDay>(props.initialDay ?? todayWeekDay())

const timeToMinutes = (value: string): number => {
  const [h = '0', m = '0'] = String(value ?? '').split(':')
  return Number(h) * 60 + Number(m)
}

const minutesToLabel = (total: number): string => {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const dayLessons = computed<ScheduleLesson[]>(() =>
  (board.value?.lessons ?? []).filter((lesson) => lesson.day === selectedDay.value),
)

/** Panjara chegaralari — shu kundagi eng erta va eng kech darsga moslashadi */
const gridStart = computed(() => {
  const starts = dayLessons.value.map((l) => timeToMinutes(l.startTime))
  const min = starts.length ? Math.min(...starts) : FALLBACK_START
  return Math.floor(Math.min(min, FALLBACK_START) / 60) * 60
})

const gridEnd = computed(() => {
  const ends = dayLessons.value.map((l) => timeToMinutes(l.endTime))
  const max = ends.length ? Math.max(...ends) : FALLBACK_END
  return Math.ceil(Math.max(max, FALLBACK_END) / 60) * 60
})

const gridHeight = computed(() => (gridEnd.value - gridStart.value) * PX_PER_MINUTE)

const hourMarks = computed(() => {
  const marks: number[] = []
  for (let m = gridStart.value; m <= gridEnd.value; m += 60) marks.push(m)
  return marks
})

interface PositionedLesson {
  lesson: ScheduleLesson
  start: number
  end: number
  /** Kesishgan darslar yonma-yon joylashadi */
  lane: number
  lanes: number
  overlapping: boolean
}

/**
 * Bir ustundagi darslarni kesishish bo'yicha "ustunchalar"ga bo'ladi.
 * Yangi ma'lumotda kesishish bo'lmaydi (backend bloklaydi), lekin eski
 * yozuvlarda uchrashi mumkin — ular yonma-yon va qizil ramka bilan chiqadi.
 */
const positionLessons = (lessons: ScheduleLesson[]): PositionedLesson[] => {
  const sorted = [...lessons]
    .map((lesson) => ({
      lesson,
      start: timeToMinutes(lesson.startTime),
      end: timeToMinutes(lesson.endTime),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end)

  const result: PositionedLesson[] = []
  let cluster: typeof sorted = []

  const flush = () => {
    if (!cluster.length) return
    const lanes: number[] = [] // har bir ustunchaning oxirgi tugash vaqti
    const positioned = cluster.map((item) => {
      let lane = lanes.findIndex((end) => end <= item.start)
      if (lane === -1) {
        lanes.push(item.end)
        lane = lanes.length - 1
      } else {
        lanes[lane] = item.end
      }
      return { ...item, lane }
    })
    for (const item of positioned) {
      result.push({ ...item, lanes: lanes.length, overlapping: lanes.length > 1 })
    }
    cluster = []
  }

  let clusterEnd = -1
  for (const item of sorted) {
    if (cluster.length && item.start >= clusterEnd) flush()
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  flush()

  return result
}

interface BoardColumn {
  key: string
  id: number | null
  name: string
  items: PositionedLesson[]
}

const columns = computed<BoardColumn[]>(() => {
  const rooms = board.value?.rooms ?? []
  const result: BoardColumn[] = rooms.map((room) => ({
    key: `room-${room.id}`,
    id: room.id,
    name: room.name,
    items: positionLessons(dayLessons.value.filter((l) => l.roomId === room.id)),
  }))

  // Xonasi biriktirilmagan darslar yo'qolib qolmasligi kerak
  const withoutRoom = dayLessons.value.filter((l) => !l.roomId)
  if (withoutRoom.length) {
    result.push({
      key: 'no-room',
      id: null,
      name: t('schedule.noRoomColumn'),
      items: positionLessons(withoutRoom),
    })
  }

  return result
})

const load = async () => {
  try {
    loading.value = true
    board.value = await fetchScheduleBoard()
  } catch (error) {
    notify.error(apiErrorMessage(error) || t('schedule.loadError'))
  } finally {
    loading.value = false
  }
}

watch(
  () => props.initialDay,
  (day) => {
    if (day) selectedDay.value = day
  },
)

onMounted(load)

defineExpose({ load })
</script>

<style scoped>
.board-scroll {
  overflow-x: auto;
  padding-bottom: 8px;
}

.board {
  display: grid;
  min-width: 100%;
  column-gap: 4px;
}

.board-corner,
.board-head {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 8px 6px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-border-color), 0.2);
  font-size: 0.8125rem;
  font-weight: 600;
  text-align: center;
}

.board-head--active {
  color: rgb(var(--v-theme-primary));
}

.board-times {
  position: relative;
}

.board-time {
  position: absolute;
  right: 8px;
  transform: translateY(-50%);
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.board-column {
  position: relative;
  border-left: 1px solid rgba(var(--v-border-color), 0.16);
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.board-column--active {
  background: rgba(var(--v-theme-primary), 0.06);
}

.board-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px dashed rgba(var(--v-border-color), 0.2);
}

.board-lesson {
  position: absolute;
  overflow: hidden;
  padding: 6px 8px;
  border-radius: 6px;
  border-left: 3px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  font-size: 0.75rem;
  line-height: 1.25;
}

.board-lesson--overlap {
  border-left-color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.12);
}

.board-lesson-time {
  font-weight: 600;
  opacity: 0.75;
}

.board-lesson-name {
  font-weight: 600;
  font-size: 0.8125rem;
  margin-top: 2px;
}

.board-lesson-meta {
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
