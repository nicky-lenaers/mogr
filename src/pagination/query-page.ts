import { Document, DocumentQuery, ModelPopulateOptions } from 'mongoose';
import { decodeCursor, getAfterSkip, getBeforeLimit, getLimit, getOffset, getQueryFilter, getSkip, getSortOrder, toPage } from './helpers';
import { PageArgs } from './types/page-args';
import { isString } from './utils';

interface PageNode<T extends Document> {
  cursor: string;
  node: T;
}

export interface PageQueryResult<T extends Document> {
  totalCount: number;
  beforeCount: number;
  afterCount: number;
  skip: number;
  limit: number;
  nodes: T[];
}

export interface Page<T> {
  totalCount: number;
  edges: Array<PageNode<T & Document>>;
  pageInfo: {
    startCursor: string;
    endCursor: string;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}

export const EMPTY_PAGE: Page<never> = {
  totalCount: 0,
  edges: [],
  pageInfo: {
    startCursor: null!,
    endCursor: null!,
    hasPrevPage: false,
    hasNextPage: false
  }
};

/**
 * Query a Page. A Mongoose Query is transformed into a Page Query
 * in order to efficiently retrieve Documents from MongoDB.
 *
 * @param query           Base Query
 * @param args            Page Arguments
 * @param projection      Projection
 * @param population      Population
 * @returns               Promisified Page
 */
export async function queryPage<T extends Document>(
  query: DocumentQuery<T[], Document>,
  args: PageArgs,
  projection: string = '',
  population: ModelPopulateOptions[] = []
): Promise<Page<T>> {

  const { filters = [], queryOptions = {} } = args;
  if (queryOptions.first === 0 || queryOptions.last === 0) return EMPTY_PAGE;

  const sortOrder = getSortOrder(queryOptions.orderBy);
  const filter = getQueryFilter(filters);

  if (filter.length) query.or(filter);

  const BaseQuery = query
    .sort(sortOrder)
    .select(projection)
    .toConstructor<T[]>();

  const totalCount = await new BaseQuery().countDocuments().exec();

  if (totalCount === 0) return EMPTY_PAGE;

  const before = decodeCursor(queryOptions.before);
  if (queryOptions.before && !before) throw new Error('Invalid Before Cursor');

  const after = decodeCursor(queryOptions.after);
  if (queryOptions.after && !after) throw new Error('Invalid After Cursor');

  const beforeLimit = getBeforeLimit(before, totalCount);
  const afterSkip = getAfterSkip(after);

  if ((beforeLimit <= 1 && beforeLimit !== totalCount) || afterSkip >= totalCount) return EMPTY_PAGE;

  const beforeOffset = isString(before) ? getOffset(before, 'BEFORE') : {};
  const afterOffset = isString(after) ? getOffset(after, 'AFTER') : {};

  const limitQueryCount = new BaseQuery()
    .where(beforeOffset)
    .limit(beforeLimit)
    .countDocuments();

  const skipQueryCount = new BaseQuery()
    .where(afterOffset)
    .skip(afterSkip)
    .countDocuments();

  const [beforeCount, afterCount] = await Promise.all([
    beforeLimit === totalCount ? totalCount : limitQueryCount.exec(),
    afterSkip === 0 ? totalCount : skipQueryCount.exec()
  ]);

  const limit = getLimit(beforeCount, queryOptions.first || queryOptions.last);
  const skip = getSkip(afterCount, totalCount, queryOptions.last);

  const nodesQuery = new BaseQuery()
    .where(beforeOffset)
    .where(afterOffset)
    .skip(skip)
    .limit(limit);

  population.forEach(field => nodesQuery.populate(field));

  const nodes = await nodesQuery.exec();

  return toPage({
    totalCount,
    beforeCount,
    afterCount,
    skip,
    limit,
    nodes
  });
}
