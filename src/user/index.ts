import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../../db/schema';

const user = new Hono<{ Bindings: { DB: D1Database } }>();

user
  .get('/', async (c) => {
    const db = drizzle(c.env.DB);
    const res = await db.select().from(users);
    return c.json(res);
  })
  .post('/', async (c) => {
    const db = drizzle(c.env.DB);
    const user = await c.req.json<typeof users.$inferInsert>();
    const res = await db.insert(users).values(user);
    return c.json(res);
  })
  .delete('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.delete(users).where(eq(users.id, id));
    return c.json(res);
  });

export default user;
