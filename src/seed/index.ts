import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { scenarios, scenarioTags, tags } from '../../db/schema';
import { scenarioData, tagData } from '../../db/place_holder';

const seed = new Hono<{ Bindings: { DB: D1Database } }>();

seed
  .get('/scenarios', async (c) => {
    const db = drizzle(c.env.DB);

    const tagsRawData = await db.select().from(tags);
    const tagMap = tagsRawData.reduce((acc, item) => {
      acc[item.name] = item.id;
      return acc;
    }, {} as Record<string, string>);

    var success = 0;
    scenarioData.map(async (scenario) => {
      const insertScenarioResult = await db
        .insert(scenarios)
        .values(scenario)
        .returning({ insertedId: scenarios.id });

      if (insertScenarioResult.length > 0) {
        console.log(scenario.name);

        scenario.scenarioTag.map(async (tag) => {
          console.log(tag);

          const tagData = {
            scenarioId: insertScenarioResult[0].insertedId,
            tagId: tagMap[tag],
          };

          const insertScenarioTagResult = await db
            .insert(scenarioTags)
            .values(tagData)
            .execute();

          console.log(insertScenarioTagResult);
        });
      }
    });
    return c.json({ success: success });
  })
  .get('/tags', async (c) => {
    const db = drizzle(c.env.DB);

    var results: D1Result[] = [];
    tagData.map(async (tag) => {
      const res = await db.insert(tags).values(tag);
      console.log(res);
      results = [...results, res];
    });
    return c.json(results);
  });

export default seed;
