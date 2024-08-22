import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { sessionParticipants } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { withUpdatedAt } from '../utils';

const sessionParticipant = new Hono<{ Bindings: { DB: D1Database } }>();

sessionParticipant
  .get('/', async (c) => {
    const db = drizzle(c.env.DB);
    const result = await db.select().from(sessionParticipants);
    return c.json(result);
  })
  .get('/:session_id', async (c) => {
    const db = drizzle(c.env.DB);
    const session_id = await c.req.param('session_id');
    const result = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, session_id));
    return c.json(result);
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const user = await c.req.json<typeof sessionParticipants.$inferInsert>();
    const res = await db.insert(sessionParticipants).values(user);
    return c.json(res);
  })
  .post('/:session_id', async (c) => {
    const db = drizzle(c.env.DB);
    const session_id = await c.req.param('session_id');
    const updatedData = await c.req.json<
      typeof sessionParticipants.$inferInsert
    >();
    const res = await db
      .update(sessionParticipants)
      .set(withUpdatedAt(updatedData))
      .where(eq(sessionParticipants.sessionId, session_id));
    return c.json(res);
  })
  .delete('/:session_id', async (c) => {
    const db = drizzle(c.env.DB);
    const session_id = await c.req.param('session_id');
    const res = await db
      .delete(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, session_id));
    return c.json(res);
  });

export default sessionParticipants;
