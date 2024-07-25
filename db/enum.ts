export const Role = {
  MODERATOR: 'MODERATOR',
  MEMBER: 'MEMBER',
} as const;

export const SessionPhase = {
  RECRUITING: 'RECRUITING',
  PREPARATION: 'PREPARATION',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const HandoutType = {
  NONE: 'NONE',
  PUBLIC: 'PUBLIC',
  SECRET: 'SECRET',
} as const;

export const SchedulePhase = {
  ADJUSTING: 'ADJUSTING',
  CONFIRMED: 'CONFIRMED',
} as const;

export const ParticipantType = {
  PLAYER: 'PLAYER',
  SPECTATOR: 'SPECTATOR',
} as const;

export const ParticipantStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
} as const;
