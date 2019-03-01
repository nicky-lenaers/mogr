import { Document, Types } from 'mongoose';
import { Page, PageQueryResult } from './query-page';
import { FilterOperatorTypes, OrderByOptions, PageArgsFilter } from './types/page-args';
import { base64Decode, base64Encode, escapeRegExp, fieldKey, isNumber, isNumericString } from './utils';

/**
 * Retrieve the Sort Order.
 *
 * @param orderByOptions        Order By Options
 * @returns                     Sort Order
 */
export function getSortOrder(orderByOptions: OrderByOptions = []): string {

  return orderByOptions
    .reduce((acc, curr, index) => {
      const field = curr.field === 'id' ? '_id' : curr.field;
      acc = acc + `${index > 0 ? ' ' : ''}${curr.direction === 'DESC' ? '-' : ''}${field}`;
      return acc;
    }, '');
}

/**
 * Apply a Filter to a Query.
 *
 * @param query         Base Query
 * @param filters       Filters
 * @returns             Filtered Document Query
 */
export function getQueryFilter(filters: PageArgsFilter[]): any[] {

  const queryFilter: any[] = [];

  filters
    .forEach(filter => {

      const filterConditions: any[] = [];

      Object
        .keys(filter)
        .forEach((field: string) => {

          Object
            .keys(filter[field])
            .forEach((operator: string) => {

              const operatorKey = operator as keyof typeof FilterOperatorTypes;
              const filterKey = FilterOperatorTypes[operatorKey];

              switch (operatorKey) {
                case 'contains': {

                  const filterValue = filter[field][operatorKey]!;

                  filterConditions.push({
                    [fieldKey(field)]: {
                      [filterKey]: escapeRegExp(filterValue.value),
                      $options: filterValue.options || ''
                    }
                  });
                  return;
                }
                default: {

                  const filterValue = filter[field][operatorKey];

                  filterConditions.push({
                    [fieldKey(field)]: {
                      [filterKey]: filterValue
                    }
                  });
                  return;
                }
              }
            });
        });
      queryFilter.push({ $and: filterConditions });
    });

  return queryFilter;
}

/**
 * Decode a Cursor.
 *
 * @param cursor        Encoded Cursor
 * @returns             Decoded Cursor
 */
export function decodeCursor(cursor: string = null!): string | number {

  if (!cursor) return null!;

  try {
    const decoded = base64Decode(cursor);
    const isNumeric = isNumericString(decoded);

    if (!Types.ObjectId.isValid(decoded) && !isNumeric) {
      throw new Error('Invalid Cursor');
    }

    return isNumeric ? +decoded : decoded;
  } catch (err) {
    return null!;
  }
}

/**
 * Retrieve the Limit from the Before Cursor.
 *
 * @param before        Decoded Before Cursor
 * @param totalCount    Total Count
 * @returns             Before Limit
 */
export function getBeforeLimit(before: string | number, totalCount: number): number {
  const cursorUpperBound = isNumber(before) ? before - 1 : Infinity;
  return Math.min(cursorUpperBound, totalCount);
}

/**
 * Retrieve the Skip from the After Cursor.
 *
 * @param after           Decoded After Cursor
 * @returns               After Skip
 */
export function getAfterSkip(after: string | number): number {
  return isNumber(after) ? after : 0;
}

/**
 * Retrieve the Query Limit.
 *
 * @param beforeCount     Before Count
 * @param first           First
 * @returns               Limit
 */
export function getLimit(beforeCount: number, first: number = Infinity): number {
  return Math.min(beforeCount, first);
}

/**
 * Retrieve the Query Skip.
 *
 * @param afterCount      After Count
 * @param last            Last
 * @param totalCount      Total Count
 * @returns               Skip
 */
export function getSkip(afterCount: number, totalCount: number, last: number = Infinity): number {
  const diff = afterCount - Math.min(Math.max(last, 0), afterCount);
  return totalCount - afterCount + diff;
}

/**
 * Retrieve the Query Offset.
 *
 * @param decodedCursor         Decoded Cursor
 * @param type                  Offset Type
 * @returns                     Offset
 */
export function getOffset(decodedCursor: string, type: 'BEFORE' | 'AFTER'): { _id?: Record<string, string> } {

  if (!decodedCursor) return {};

  const operator = type === 'BEFORE' ? '$lt' : '$gt';

  return {
    _id: {
      [operator]: decodedCursor
    }
  };
}

/**
 * Transform a Query Result into a properly structured Page.
 *
 * @param result        Query Result
 * @returns             Page
 */
export function toPage<T extends Document>(result: PageQueryResult<T>): Page<T> {

  const edges = result
    .nodes
    .map(node => ({
      cursor: node.id ? base64Encode(node.id.toString()) : null!,
      node
    }));

  return {
    totalCount: result.totalCount,
    edges,
    pageInfo: {
      startCursor: edges.length > 0 ? edges[0].cursor : null!,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null!,
      hasPrevPage: result.afterCount < result.totalCount || result.skip > 0,
      hasNextPage: result.beforeCount < result.totalCount || result.afterCount - result.limit > 0
    }
  };
}
