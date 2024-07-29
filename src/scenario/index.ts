import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { scenarios, scenarioTags } from '../../db/schema';
import { buildWhereClause, SearchCondition } from '../SQLCondition';
import { parseNumber, withUpdatedAt } from '../utils';

const scenario = new Hono<{ Bindings: { DB: D1Database } }>();

scenario
  .get('/', async (c) => {
    const { name, id, limit: limitStr } = await c.req.query();
    const limit = parseNumber(limitStr);

    const db = drizzle(c.env.DB);

    const conditions: SearchCondition<typeof scenarios> = {};

    if (name) conditions.name = { value: name, operator: 'like' };
    if (id) conditions.id = { value: id, operator: 'eq' };

    const whereClause = buildWhereClause(scenarios, conditions);

    const result = await db
      .select()
      .from(scenarios)
      .where(whereClause)
      .leftJoin(scenarioTags, eq(scenarios.id, scenarioTags.scenarioId))
      .limit(limit)
      .orderBy(scenarios.name);
    return c.json(result);
  })
  .get('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.id, id))
      .leftJoin(scenarioTags, eq(scenarios.id, scenarioTags.scenarioId));
    return c.json(res);
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const newData = await c.req.json<typeof scenarios.$inferInsert>();
    const res = await db.insert(scenarios).values(newData);
    return c.json(res);
  })
  .post('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const updatedData = await c.req.json<typeof scenarios.$inferInsert>();
    const res = await db
      .update(scenarios)
      .set(withUpdatedAt(updatedData))
      .where(eq(scenarios.id, id));
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.delete(scenarios).where(eq(scenarios.id, id));
    return c.json(res);
  });

export default scenario;
