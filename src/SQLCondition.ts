import { and, eq, like, SQL } from 'drizzle-orm';
import { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';

export type SearchCondition<T extends SQLiteTableWithColumns<any>> = {
  [K in keyof T['_']['columns']]?: {
    value: T['_']['columns'][K]['_']['data'];
    operator: 'eq' | 'like';
  };
};

export function buildWhereClause<T extends SQLiteTableWithColumns<any>>(
  table: T,
  conditions: SearchCondition<T>
): SQL | undefined {
  const filters = Object.entries(conditions).map(([key, condition]) => {
    const column = table[key as keyof T];
    if (condition.operator === 'eq') {
      return eq(column, condition.value);
    } else if (condition.operator === 'like') {
      return like(column, `%${condition.value}%`);
    }
    throw new Error(`Unsupported operator: ${condition.operator}`);
  });

  return filters.length > 0 ? and(...filters) : undefined;
}
