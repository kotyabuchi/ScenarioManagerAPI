import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema';
import { buildWhereClause, SearchCondition } from '../SQLCondition';
import { parseNumber, withUpdatedAt } from '../utils';

const user = new Hono<{ Bindings: { DB: D1Database } }>();

user
  .get('/', async (c) => {
    const { limit: limitStr } = await c.req.query();
    const limit = parseNumber(limitStr);

    const db = drizzle(c.env.DB);
    const res = await db
      .select()
      .from(users)
      .limit(limit)
      .orderBy(users.nickname);
    return c.json(res);
  })
  .get('/search', async (c) => {
    const { nickname, username, id, limit: limitStr } = await c.req.query();
    const limit = parseNumber(limitStr);

    const db = drizzle(c.env.DB);

    const conditions: SearchCondition<typeof users> = {};

    if (nickname) conditions.nickname = { value: nickname, operator: 'like' };
    if (username) conditions.username = { value: username, operator: 'eq' };
    if (id) conditions.id = { value: id, operator: 'eq' };

    const whereClause = buildWhereClause(users, conditions);
    const res = await db
      .select()
      .from(users)
      .where(whereClause)
      .limit(limit)
      .orderBy(users.nickname);
    return c.json(res);
  })
  .get('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.select().from(users).where(eq(users.id, id));
    return c.json(res);
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const newData = await c.req.json<typeof users.$inferInsert>();
    const res = await db.insert(users).values(newData);
    return c.json(res);
  })
  .post('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const updatedData = await c.req.json<typeof users.$inferInsert>();
    const res = await db
      .update(users)
      .set(withUpdatedAt(updatedData))
      .where(eq(users.id, id));
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.delete(users).where(eq(users.id, id));
    return c.json(res);
  });

export default user;
