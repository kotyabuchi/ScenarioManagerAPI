import { Hono } from 'hono';
import user from './user';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.route('users', user);

export default app;
