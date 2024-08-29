import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  unique,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import {
  HandoutType,
  ParticipantStatus,
  ParticipantType,
  Role,
  SchedulePhase,
  SessionPhase,
} from './enum';

export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    discordId: text('discord_id').notNull().unique(),
    username: text('user_name').notNull().unique(),
    nickname: text('nickname').notNull(),
    password: text('password').notNull(),
    passwordSalt: text('password_salt').notNull(),
    bio: text('bio'),
    avatar: text('avatar'),
    role: text('role', { enum: Object.values(Role) as [string, ...string[]] })
      .notNull()
      .default(Role.MEMBER),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    usersUsernameIdx: index('users_username_idx').on(table.username),
    usersNicknameIdx: index('users_nickname_idx').on(table.nickname),
  })
);

export const scenarios = sqliteTable(
  'scenarios',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    author: text('author'),
    description: text('description'),
    shortDescription: text('short_description'),
    scenarioImage: text('scenario_image'),
    minPlayer: integer('min_player'),
    maxPlayer: integer('max_player'),
    minPlaytime: integer('min_playtime'),
    maxPlaytime: integer('max_playtime'),
    handoutType: text('handout_type', {
      enum: Object.values(HandoutType) as [string, ...string[]],
    })
      .notNull()
      .default(HandoutType.NONE),
    distributeUrl: text('distribute_url'),
    createdById: text('created_by_id').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    scenariosNameIdx: index('scenarios_name_idx').on(table.name),
  })
);

export const scenarioTags = sqliteTable(
  'scenario_tags',
  {
    scenarioId: text('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.scenarioId, table.tagId] }),
  })
);

export const tags = sqliteTable('tags', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(),
  color: text('color'),
});

export const gameSessions = sqliteTable(
  'game_sessions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scenarioId: text('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    sessionPhase: text('session_phase', {
      enum: Object.values(SessionPhase) as [string, ...string[]],
    })
      .notNull()
      .default(SessionPhase.RECRUITING),
    keeperId: text('keeper_id').references(() => users.id),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    gameSessionsScenarioIdx: index('game_sessions_scenario_idx').on(
      table.scenarioId
    ),
  })
);

export const sessionParticipants = sqliteTable(
  'session_participants',
  {
    sessionId: text('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    playerType: text('player_type', {
      enum: Object.values(ParticipantType) as [string, ...string[]],
    })
      .notNull()
      .default(ParticipantType.PLAYER),
    playerState: text('player_state', {
      enum: Object.values(ParticipantStatus) as [string, ...string[]],
    })
      .notNull()
      .default(ParticipantStatus.PENDING),
    characterSheetUrl: text('character_sheet_url'),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.sessionId, table.userId] }),
  })
);

export const gameSchedules = sqliteTable(
  'game_schedules',
  {
    sessionId: text('session_id')
      .notNull()
      .unique()
      .primaryKey()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    scheduleDate: integer('schedule_date', { mode: 'timestamp' }).notNull(),
    schedulePhase: text('schedule_phase', {
      enum: Object.values(SchedulePhase) as [string, ...string[]],
    })
      .notNull()
      .default(SchedulePhase.ADJUSTING),
  },
  (table) => ({
    gameSchedulesDateIdx: index('game_schedules_date_idx').on(
      table.scheduleDate
    ),
  })
);

export const videoLinks = sqliteTable(
  'video_links',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scenarioId: text('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    videoUrl: text('video_url').notNull().unique(),
    createdById: text('created_by_id')
      .notNull()
      .references(() => users.id),
  },
  (table) => ({
    videoLinksScenarioIdx: index('video_links_scenario_idx').on(
      table.scenarioId
    ),
    videoLinksSessionIdx: index('video_links_session_idx').on(table.sessionId),
  })
);

export const userReviews = sqliteTable(
  'user_reviews',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    scenarioId: text('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').references(() => gameSessions.id),
    openComment: text('open_comment'),
    spoilerComment: text('spoiler_comment'),
    rating: integer('rating'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    unq: unique().on(table.scenarioId, table.userId),
    userReviewsScenarioIdx: index('user_reviews_scenario_idx').on(
      table.scenarioId
    ),
    userReviewsSessionIdx: index('user_reviews_session_idx').on(
      table.sessionId
    ),
  })
);

export const userScenarioPreferences = sqliteTable(
  'user_scenario_preferences',
  {
    scenarioId: text('scenario_id')
      .notNull()
      .references(() => scenarios.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text('session_id').references(() => gameSessions.id),
    isPlayed: integer('is_played', { mode: 'boolean' }).notNull(),
    isWatched: integer('is_watched', { mode: 'boolean' }).notNull(),
    canKeeper: integer('can_keeper', { mode: 'boolean' }).notNull(),
    hadScenario: integer('had_scenario', { mode: 'boolean' }).notNull(),
    isLike: integer('is_like', { mode: 'boolean' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.scenarioId, table.userId] }),
    userScenarioPreferencesSessionIdx: index(
      'user_scenario_preferences_session_idx'
    ).on(table.sessionId),
  })
);

export const userRelations = relations(users, ({ many }) => ({
  participatedSessions: many(sessionParticipants),
  keptSessions: many(gameSessions, { relationName: 'keeper' }),
  reviews: many(userReviews),
  videoLinks: many(videoLinks),
  scenarioPreferences: many(userScenarioPreferences),
}));

export const scenarioRelations = relations(scenarios, ({ many }) => ({
  sessions: many(gameSessions),
  reviews: many(userReviews),
  preferences: many(userScenarioPreferences),
  videoLinks: many(videoLinks),
}));

export const gameSessionRelations = relations(
  gameSessions,
  ({ one, many }) => ({
    scenario: one(scenarios, {
      fields: [gameSessions.scenarioId],
      references: [scenarios.id],
    }),
    keeper: one(users, {
      fields: [gameSessions.keeperId],
      references: [users.id],
      relationName: 'keeper',
    }),
    participants: many(sessionParticipants),
    reviews: many(userReviews),
    preferences: many(userScenarioPreferences),
    videoLinks: many(videoLinks),
  })
);

export const sessionParticipantRelations = relations(
  sessionParticipants,
  ({ one }) => ({
    user: one(users, {
      fields: [sessionParticipants.userId],
      references: [users.id],
    }),
    session: one(gameSessions, {
      fields: [sessionParticipants.sessionId],
      references: [gameSessions.id],
    }),
  })
);

export const videoLinkRelations = relations(videoLinks, ({ one }) => ({
  scenario: one(scenarios, {
    fields: [videoLinks.scenarioId],
    references: [scenarios.id],
  }),
  session: one(gameSessions, {
    fields: [videoLinks.sessionId],
    references: [gameSessions.id],
  }),
}));

export const userReviewRelations = relations(userReviews, ({ one }) => ({
  user: one(users, {
    fields: [userReviews.userId],
    references: [users.id],
  }),
  scenario: one(scenarios, {
    fields: [userReviews.scenarioId],
    references: [scenarios.id],
  }),
  session: one(gameSessions, {
    fields: [userReviews.sessionId],
    references: [gameSessions.id],
  }),
}));

export const userScenarioPreferenceRelations = relations(
  userScenarioPreferences,
  ({ one }) => ({
    user: one(users, {
      fields: [userScenarioPreferences.userId],
      references: [users.id],
    }),
    scenario: one(scenarios, {
      fields: [userScenarioPreferences.scenarioId],
      references: [scenarios.id],
    }),
    session: one(gameSessions, {
      fields: [userScenarioPreferences.sessionId],
      references: [gameSessions.id],
    }),
  })
);

export const schema = {
  users,
  scenarios,
  gameSessions,
  gameSchedules,
  videoLinks,
  sessionParticipants,
  userReviews,
  userScenarioPreferences,
  tags,
  scenarioTags,
  userRelations,
  scenarioRelations,
  gameSessionRelations,
  sessionParticipantRelations,
  videoLinkRelations,
  userReviewRelations,
  userScenarioPreferenceRelations,
};
