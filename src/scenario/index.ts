import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { scenarios } from '../../db/schema';
import { buildWhereClause, SearchCondition } from '../SQLCondition';

const scenario = new Hono<{ Bindings: { DB: D1Database } }>();

scenario
  .get('/', async (c) => {
    const { name, id } = await c.req.query();
    const db = drizzle(c.env.DB);

    const conditions: SearchCondition<typeof scenarios> = {};

    if (name) conditions.name = { value: name, operator: 'like' };
    if (id) conditions.id = { value: id, operator: 'eq' };

    const whereClause = buildWhereClause(scenarios, conditions);

    const result = await db.select().from(scenarios).where(whereClause);
    return c.json(result);
  })
  .get('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return c.json(res);
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const user = await c.req.json<typeof scenarios.$inferInsert>();
    const res = await db.insert(scenarios).values(user);
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.delete(scenarios).where(eq(scenarios.id, id));
    return c.json(res);
  });

export default scenario;
