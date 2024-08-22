import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { gameSessions, scenarios, scenarioTags, tags } from '../../db/schema';
import { buildWhereClause, SearchCondition } from '../SQLCondition';
import { parseNumber, withUpdatedAt } from '../utils';
import PerformanceMonitor from '../PerformanceMonitor';

const scenario = new Hono<{ Bindings: { DB: D1Database } }>();

scenario
  .get('/', async (c) => {
    const { limit: limitStr, offset: offsetStr } = await c.req.query();
    const limit = parseNumber(limitStr) || 100;
    const offset = parseNumber(offsetStr);

    const db = drizzle(c.env.DB);

    const query = db
      .select()
      .from(scenarios)
      .groupBy(scenarios.id)
      .orderBy(scenarios.name)
      .limit(limit)
      .offset(offset);

    // クエリの実行
    const results = await query.all();

    return c.json(results);
  })
  .get('/search', async (c) => {
    const {
      name,
      id,
      limit: limitStr,
      offset: offsetStr,
    } = await c.req.query();
    const limit = parseNumber(limitStr) || 100;
    const offset = parseNumber(offsetStr);

    const db = drizzle(c.env.DB);

    const conditions: SearchCondition<typeof scenarios> = {};

    if (name) conditions.name = { value: name, operator: 'like' };
    if (id) conditions.id = { value: id, operator: 'eq' };

    const whereClause = buildWhereClause(scenarios, conditions);

    const query = db
      .select()
      .from(scenarios)
      .where(whereClause)
      .groupBy(scenarios.id)
      .orderBy(scenarios.name)
      .limit(limit)
      .offset(offset);

    // クエリの実行
    const results = await query.all();

    return c.json(results);
  })
  .get('/withtag', async (c) => {
    const { limit: limitStr, offset: offsetStr } = await c.req.query();
    const limit = parseNumber(limitStr) || 100;
    const offset = parseNumber(offsetStr);

    const db = drizzle(c.env.DB);

    const query = db
      .select({
        id: scenarios.id,
        name: scenarios.name,
        author: scenarios.author,
        description: scenarios.description,
        shortDescription: scenarios.shortDescription,
        scenarioImage: scenarios.scenarioImage,
        minPlayer: scenarios.minPlayer,
        maxPlayer: scenarios.maxPlayer,
        minPlaytime: scenarios.minPlaytime,
        maxPlaytime: scenarios.maxPlaytime,
        handoutType: scenarios.handoutType,
        distributeUrl: scenarios.distributeUrl,
        createdById: scenarios.createdById,
        createdAt: scenarios.createdAt,
        updatedAt: scenarios.updatedAt,
        tagsJson:
          sql<string>`json_group_array(json_object('name', ${tags.name}, 'color', ${tags.color}))`.as(
            'tags_json'
          ),
      })
      .from(scenarios)
      .leftJoin(scenarioTags, eq(scenarios.id, scenarioTags.scenarioId))
      .leftJoin(tags, eq(scenarioTags.tagId, tags.id))
      .groupBy(scenarios.id)
      .orderBy(scenarios.name)
      .limit(limit)
      .offset(offset);

    // クエリの実行
    const results = await query.all();

    const processedResults = results.map(({ tagsJson, ...rest }) => ({
      ...rest,
      tags: JSON.parse(tagsJson).filter((tag: any) => tag.name !== null),
    }));

    return c.json(processedResults);
  })
  .get('/withtag/search', async (c) => {
    const {
      name,
      id,
      limit: limitStr,
      offset: offsetStr,
    } = await c.req.query();
    const limit = parseNumber(limitStr) || 100;
    const offset = parseNumber(offsetStr);

    const monitor = new PerformanceMonitor();
    const db = drizzle(c.env.DB, {
      logger: {
        logQuery: monitor.logQuery.bind(monitor),
      },
    });

    const conditions: SearchCondition<typeof scenarios> = {};

    if (name) conditions.name = { value: name, operator: 'like' };
    if (id) conditions.id = { value: id, operator: 'eq' };

    const whereClause = buildWhereClause(scenarios, conditions);

    const query = db
      .select({
        id: scenarios.id,
        name: scenarios.name,
        author: scenarios.author,
        description: scenarios.description,
        shortDescription: scenarios.shortDescription,
        scenarioImage: scenarios.scenarioImage,
        minPlayer: scenarios.minPlayer,
        maxPlayer: scenarios.maxPlayer,
        minPlaytime: scenarios.minPlaytime,
        maxPlaytime: scenarios.maxPlaytime,
        handoutType: scenarios.handoutType,
        distributeUrl: scenarios.distributeUrl,
        createdById: scenarios.createdById,
        createdAt: scenarios.createdAt,
        updatedAt: scenarios.updatedAt,
        tagsJson:
          sql<string>`json_group_array(json_object('name', ${tags.name}, 'color', ${tags.color}))`.as(
            'tags_json'
          ),
      })
      .from(scenarios)
      .where(whereClause)
      .leftJoin(scenarioTags, eq(scenarios.id, scenarioTags.scenarioId))
      .leftJoin(tags, eq(scenarioTags.tagId, tags.id))
      .groupBy(scenarios.id)
      .orderBy(scenarios.name)
      .limit(limit)
      .offset(offset);

    // クエリの実行
    const results = await query.all();

    const processedResults = results.map(({ tagsJson, ...rest }) => ({
      ...rest,
      tags: JSON.parse(tagsJson).filter((tag: any) => tag.name !== null),
    }));

    monitor.end();
    return c.json(processedResults);
  })
  .get('/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');
    const res = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return c.json(res);
  })
  .get('/withtag/:id', async (c) => {
    const db = drizzle(c.env.DB);
    const id = await c.req.param('id');

    const query = db
      .select({
        id: scenarios.id,
        name: scenarios.name,
        author: scenarios.author,
        description: scenarios.description,
        shortDescription: scenarios.shortDescription,
        scenarioImage: scenarios.scenarioImage,
        minPlayer: scenarios.minPlayer,
        maxPlayer: scenarios.maxPlayer,
        minPlaytime: scenarios.minPlaytime,
        maxPlaytime: scenarios.maxPlaytime,
        handoutType: scenarios.handoutType,
        distributeUrl: scenarios.distributeUrl,
        createdById: scenarios.createdById,
        createdAt: scenarios.createdAt,
        updatedAt: scenarios.updatedAt,
        tagsJson:
          sql<string>`json_group_array(json_object('name', ${tags.name}, 'color', ${tags.color}))`.as(
            'tags_json'
          ),
      })
      .from(scenarios)
      .where(eq(scenarios.id, id))
      .leftJoin(scenarioTags, eq(scenarios.id, scenarioTags.scenarioId))
      .leftJoin(tags, eq(scenarioTags.tagId, tags.id))
      .groupBy(scenarios.id)
      .orderBy(scenarios.name);

    // クエリの実行
    const results = await query.all();

    const processedResults = results.map(({ tagsJson, ...rest }) => ({
      ...rest,
      tags: JSON.parse(tagsJson).filter((tag: any) => tag.name !== null),
    }));

    return c.json(processedResults);
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
  })
  .get('/:scenario_id/sessions', async (c) => {
    const db = drizzle(c.env.DB);
    const scenarioId = await c.req.param('scenario_id');
    const result = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.scenarioId, scenarioId));
    return c.json(result);
  });

export default scenario;
