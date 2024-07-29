import { Hono } from 'hono';
import user from './user';
import scenario from './scenario';
import tag from './tag';
import gameSession from './game_session';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app
  .route('users', user)
  .route('scenarios', scenario)
  .route('tag', tag)
  .route('gameSession', gameSession);

export default app;
