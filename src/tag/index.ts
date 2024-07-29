import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { tags } from '../../db/schema';

const tag = new Hono<{ Bindings: { DB: D1Database } }>();

tag.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const result = await db.select().from(tags);
  return c.json(result);
});
