import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { gameSessions, schema } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { withUpdatedAt } from '../utils';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const gameSession = new Hono<{ Bindings: { DB: D1Database } }>();

gameSession
  .get(
    '/',
    zValidator(
      'query',
      z.object({
        scenarioId: z.string().optional(),
        limit: z.number().default(100),
        offset: z.number().default(0),
        include: z.string().optional(),
      })
    ),
    async (c) => {
      try {
        const {
          scenarioId,
          limit,
          offset,
          include: includeParam,
        } = await c.req.valid('query');

        const include = includeParam?.split(',') ?? [];

        const db = drizzle(c.env.DB, { schema });

        const result = await db.query.gameSessions.findMany({
          where: scenarioId
            ? eq(gameSessions.scenarioId, scenarioId)
            : undefined,
          limit: limit,
          offset: offset,
          with: {
            keeper: include.includes('keeper')
              ? {
                  columns: {
                    id: true,
                    username: true,
                    nickname: true,
                    avatar: true,
                  },
                }
              : undefined,
            participants: include.includes('participants')
              ? {
                  columns: {
                    playerType: true,
                    playerState: true,
                    characterSheetUrl: true,
                  },
                  with: {
                    user: {
                      columns: {
                        id: true,
                        username: true,
                        nickname: true,
                        avatar: true,
                      },
                    },
                  },
                }
              : undefined,
            scenario: include.includes('scenario') ? true : undefined,
            reviews: include.includes('reviews') ? true : undefined,
            preferences: include.includes('preferences') ? true : undefined,
            videoLinks: include.includes('videoLinks') ? true : undefined,
          },
        });

        return c.json(result);
      } catch (error) {
        console.error('ゲームセッションの取得中にエラーが発生しました:', error);
        return c.json(
          { error: 'ゲームセッションの取得中に問題が発生しました' },
          500
        );
      }
    }
  )
  .get('/:session_id', async (c) => {
    try {
      const includeParam = await c.req.query('include');
      const include = includeParam?.split(',') ?? [];

      const db = drizzle(c.env.DB, { schema });
      const sessionId = await c.req.param('session_id');

      const result = await db.query.gameSessions.findFirst({
        where: eq(gameSessions.id, sessionId),
        with: {
          keeper: include.includes('keeper')
            ? {
                columns: {
                  id: true,
                  username: true,
                  nickname: true,
                  avatar: true,
                },
              }
            : undefined,
          participants: include.includes('participants')
            ? {
                columns: {
                  playerType: true,
                  playerState: true,
                  characterSheetUrl: true,
                },
                with: {
                  user: {
                    columns: {
                      id: true,
                      username: true,
                      nickname: true,
                      avatar: true,
                    },
                  },
                },
              }
            : undefined,
          scenario: include.includes('scenario') ? true : undefined,
          reviews: include.includes('reviews') ? true : undefined,
          videoLinks: include.includes('videoLinks') ? true : undefined,
          preferences: include.includes('preferences') ? true : undefined,
        },
      });

      if (!result) {
        return c.json({ error: 'セッションが見つかりません' }, 404);
      }

      return c.json(result);
    } catch (error) {
      console.error('ゲームセッションの取得中にエラーが発生しました:', error);
      return c.json(
        { error: 'ゲームセッションの取得中に問題が発生しました' },
        500
      );
    }
  })
  .get('/:session_id/full', async (c) => {
    try {
      const db = drizzle(c.env.DB, { schema });
      const sessionId = await c.req.param('session_id');

      const result = await db.query.gameSessions.findFirst({
        with: {
          keeper: {
            columns: {
              id: true,
              username: true,
              nickname: true,
              avatar: true,
            },
          },
          participants: {
            columns: {
              playerType: true,
              playerState: true,
              characterSheetUrl: true,
            },
            with: {
              user: {
                columns: {
                  id: true,
                  username: true,
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
          scenario: true,
          reviews: true,
          videoLinks: true,
          preferences: true,
        },
        where: eq(gameSessions.id, sessionId),
      });

      if (!result) {
        return c.json({ error: 'セッションが見つかりません' }, 404);
      }

      return c.json(result);
    } catch (error) {
      console.error('ゲームセッションの取得中にエラーが発生しました:', error);
      return c.json(
        { error: 'ゲームセッションの取得中に問題が発生しました' },
        500
      );
    }
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const user = await c.req.json<typeof gameSessions.$inferInsert>();
    const res = await db.insert(gameSessions).values(user);
    return c.json(res);
  })
  .post('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const updatedData = await c.req.json<typeof gameSessions.$inferInsert>();
    const res = await db
      .update(gameSessions)
      .set(withUpdatedAt(updatedData))
      .where(eq(gameSessions.id, id));
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.delete(gameSessions).where(eq(gameSessions.id, id));
    return c.json(res);
  });

export default gameSession;
