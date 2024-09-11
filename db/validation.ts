import { createSelectSchema } from 'drizzle-zod';
import {
  gameSchedules,
  gameSessions,
  scenarios,
  scenarioTags,
  sessionParticipants,
  tags,
  userReviews,
  users,
  userScenarioPreferences,
  videoLinks,
} from './schema';
import { z } from 'zod';
import {
  HandoutType,
  ParticipantStatus,
  ParticipantType,
  Role,
  SchedulePhase,
  SessionPhase,
} from './enum';
import { isCuid } from '@paralleldrive/cuid2';

const cuidSchema = z.string().refine((data) => isCuid(data));
const urlSchema = z.string().url();

const validateMinMax = (
  min: number | null | undefined,
  max: number | null | undefined
) => {
  if (
    min !== null &&
    min !== undefined &&
    max !== null &&
    max !== undefined &&
    min > max
  ) {
    return false;
  }
  return true;
};

const enumRefine = (
  enumType: Record<string, string>,
  value: string | undefined
) => {
  return Object.values(enumType).includes(value ?? '');
};

// User
const userSchema = createSelectSchema(users, {
  id: cuidSchema,
  discordId: z
    .string()
    .min(1)
    .regex(/^[0-9]+$/),
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/),
  nickname: z.string().min(1),
  bio: z.string().nullish(),
  avatar: urlSchema.nullish(),
  role: z
    .nativeEnum(Role)
    .default(Role.MEMBER)
    .refine((data) => enumRefine(Role, data)),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserSchema = userSchema.partial();
export const updateUserSchema = selectUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Scenario
const scenarioSchema = createSelectSchema(scenarios, {
  id: cuidSchema,
  name: z.string().min(1),
  author: z.string().min(1),
  description: z.string().min(1).nullish(),
  shortDescription: z.string().min(1).nullish(),
  scenarioImage: urlSchema.nullish(),
  minPlayer: z.number().min(1).positive().nullish(),
  maxPlayer: z.number().min(1).positive().nullish(),
  minPlaytime: z.number().min(1).positive().nullish(),
  maxPlaytime: z.number().min(1).positive().nullish(),
  handoutType: z
    .nativeEnum(HandoutType)
    .default(HandoutType.NONE)
    .refine((data) => enumRefine(HandoutType, data)),
  distributeUrl: urlSchema,
  createdById: cuidSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const insertScenarioSchema = scenarioSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => validateMinMax(data.minPlayer, data.maxPlayer))
  .refine((data) => validateMinMax(data.minPlaytime, data.maxPlaytime));
export const selectScenarioSchema = scenarioSchema.partial();
export const updateScenarioSchema = selectScenarioSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => validateMinMax(data.minPlayer, data.maxPlayer))
  .refine((data) => validateMinMax(data.minPlaytime, data.maxPlaytime));

// ScenarioTag
const scenarioTagSchema = createSelectSchema(scenarioTags, {
  scenarioId: cuidSchema,
  tagId: cuidSchema,
});
export const insertScenarioTagSchema = scenarioTagSchema;
export const selectScenarioTagSchema = scenarioTagSchema.partial();
export const updateScenarioTagSchema = selectScenarioTagSchema;

// Tag
const tagSchema = createSelectSchema(tags, {
  id: cuidSchema,
  name: z.string().min(1),
  color: z.string().min(1).nullish(),
});
export const insertTagSchema = tagSchema.omit({
  id: true,
});
export const selectTagSchema = tagSchema.partial();
export const updateTagSchema = selectTagSchema.omit({
  id: true,
});

// GameSession
const gameSessionSchema = createSelectSchema(gameSessions, {
  id: cuidSchema,
  scenarioId: cuidSchema,
  sessionPhase: z
    .nativeEnum(SessionPhase)
    .default(SessionPhase.RECRUITING)
    .refine((value) => enumRefine(SessionPhase, value)),
  keeperId: cuidSchema.nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const insertGameSessionSchema = gameSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectGameSessionSchema = gameSessionSchema.partial();
export const updateGameSessionSchema = selectGameSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// SessionParticipants
const sessionParticipantsSchema = createSelectSchema(sessionParticipants, {
  sessionId: cuidSchema,
  userId: cuidSchema,
  playerType: z
    .nativeEnum(ParticipantType)
    .default(ParticipantType.PLAYER)
    .refine((value) => enumRefine(ParticipantType, value)),
  playerState: z
    .nativeEnum(ParticipantStatus)
    .default(ParticipantStatus.PENDING)
    .refine((value) => enumRefine(ParticipantStatus, value)),
  characterSheetUrl: urlSchema.nullish(),
});
export const insertSessionParticipantsSchema = sessionParticipantsSchema;
export const selectSessionParticipantsSchema =
  sessionParticipantsSchema.partial();
export const updateSessionParticipantsSchema = selectSessionParticipantsSchema;

// GameSchedule
const gameScheduleSchema = createSelectSchema(gameSchedules, {
  sessionId: cuidSchema,
  scheduleDate: z.date(),
  schedulePhase: z
    .nativeEnum(SchedulePhase)
    .default(SchedulePhase.ADJUSTING)
    .refine((value) => enumRefine(SchedulePhase, value)),
});
export const insertGameScheduleSchema = gameScheduleSchema;
export const selectGameScheduleSchema = gameScheduleSchema.partial();
export const updateGameScheduleSchema = selectGameScheduleSchema;

// VideoLink
const videoLinkSchema = createSelectSchema(videoLinks, {
  id: cuidSchema,
  scenarioId: cuidSchema,
  sessionId: cuidSchema,
  videoUrl: urlSchema,
  createdById: cuidSchema,
});
export const insertVideoLinkSchema = videoLinkSchema.omit({
  id: true,
});
export const selectVideoLinkSchema = videoLinkSchema.partial();
export const updateVideoLinkSchema = selectVideoLinkSchema.omit({
  id: true,
});

// UserReview
const userReviewSchema = createSelectSchema(userReviews, {
  id: cuidSchema,
  userId: cuidSchema,
  scenarioId: cuidSchema,
  sessionId: cuidSchema.nullish(),
  openComment: z.string().min(1).nullish(),
  spoilerComment: z.string().min(1).nullish(),
  rating: z.number().min(1).max(5).nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const insertUserReviewSchema = userReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectUserReviewSchema = userReviewSchema.partial();
export const updateUserReviewSchema = selectUserReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// UserScenarioPreference
const userScenarioPreferenceSchema = createSelectSchema(
  userScenarioPreferences,
  {
    scenarioId: cuidSchema,
    userId: cuidSchema,
    sessionId: cuidSchema.nullish(),
    isPlayed: z.boolean().default(false),
    isWatched: z.boolean().default(false),
    canKeeper: z.boolean().default(false),
    hadScenario: z.boolean().default(false),
    isLike: z.boolean().default(false),
  }
);
export const insertUserScenarioPreferenceSchema = userScenarioPreferenceSchema;
export const selectUserScenarioPreferenceSchema =
  userScenarioPreferenceSchema.partial();
export const updateUserScenarioPreferenceSchema =
  selectUserScenarioPreferenceSchema;
