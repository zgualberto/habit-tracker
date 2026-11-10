export const HABIT_CADENCE_VALUES = ['DAILY', 'WEEKDAYS', 'WEEKLY_TARGET'] as const;

export const HABIT_TARGET_TYPE_VALUES = ['BOOLEAN', 'COUNT'] as const;

export const HABIT_STATUS_VALUES = ['active', 'archived', 'all'] as const;

export const HABIT_NAME_MAXIMUM_LENGTH = 120;

export const HABIT_DESCRIPTION_MAXIMUM_LENGTH = 500;

export const HABIT_LOG_NOTE_MAXIMUM_LENGTH = 500;

export const HABIT_TARGET_VALUE_MINIMUM = 1;

export const HABIT_TARGET_VALUE_MAXIMUM = 1000;

export const HABIT_WEEKLY_TARGET_MINIMUM = 1;

export const HABIT_WEEKLY_TARGET_MAXIMUM = 7;

export const WEEKDAY_VALUES = [0, 1, 2, 3, 4, 5, 6] as const;

export const WEEKDAY_MINIMUM = 0;

export const WEEKDAY_MAXIMUM = 6;

export const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const REMINDER_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export const LOCAL_DATE_LENGTH = 10;

export const REMINDER_TIME_LENGTH = 5;

export const MILLISECONDS_PER_DAY = 86_400_000;

export const DEFAULT_HABIT_HISTORY_IN_DAYS = 90;

export const HABIT_INSIGHT_MAXIMUM_RANGE_IN_DAYS = 366;

export const WEEK_START_WEEKDAY = 1;

export const HABIT_STATISTICS_HISTORY_IN_DAYS = 366;

export const HABIT_LOG_HISTORY_DEFAULT_IN_DAYS = 90;
