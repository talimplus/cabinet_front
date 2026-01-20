export enum StudentStatus {
        NEW = 'new',
        ACTIVE = 'ACTIVE',
        IGNORED = 'ignored',
        STOPPED = 'stopped',
        FINISHED = 'finished'
}

export enum StudentPreferredTime {
  MORNING = 'morning',
  EVENING = 'evening',
}

export const studentStatusLabels = {
        [StudentStatus.NEW]: "Kutmoqda",
        [StudentStatus.ACTIVE]: "O'qimoqda",
        [StudentStatus.IGNORED]: "O'qishni xoxlamadi",
        [StudentStatus.STOPPED]: "O'qishni to'xtatdi",
        [StudentStatus.FINISHED]: "O'qishni tamomladi",
}