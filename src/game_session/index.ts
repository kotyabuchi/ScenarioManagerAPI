import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { gameSessions } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { parseNumber, withUpdatedAt } from '../utils';
import { buildWhereClause, SearchCondition } from '../SQLCondition';

const gameSession = new Hono<{ Bindings: { DB: D1Database } }>();

gameSession
  .get('/', async (c) => {
    const {
      scenarioId,
      limit: limitStr,
      offset: offsetStr,
    } = await c.req.query();

    const limit = parseNumber(limitStr) || 100;
    const offset = parseNumber(offsetStr);

    const db = drizzle(c.env.DB);

    const conditions: SearchCondition<typeof gameSessions> = {};

    if (scenarioId)
      conditions.scenarioId = { value: scenarioId, operator: 'eq' };

    const whereClause = buildWhereClause(gameSessions, conditions);

    const result = await db
      .select()
      .from(gameSessions)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return c.json(result);
  })
  .get('/:session_id', async (c) => {
    const db = drizzle(c.env.DB);
    const sessionId = await c.req.param('session_id');
    const result = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));
    return c.json(result);
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
