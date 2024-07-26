import { Hono } from 'hono';
import user from './user';
import scenario from './scenario';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.route('users', user).route('scenarios', scenario);

export default app;
