import { Hono } from 'hono';
import user from './user';
import scenario from './scenario';
import tag from './tag';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.route('users', user).route('scenarios', scenario).route('tag', tag);

export default app;
