import { Document, Types } from 'mongoose';
import { decodeCursor, getAfterSkip, getBeforeLimit, getLimit, getOffset, getQueryFilter, getSkip, getSortOrder, toPage } from './helpers';
import { Page, PageQueryResult } from './query-page';
import { OrderByOptions, PageArgsFilter } from './types/page-args';
import { base64Encode } from './utils';

describe('helpers', () => {

  describe('getSortOrder', () => {

    it('should generate a sort order', () => {

      const orderByOptionsEmpty: OrderByOptions = [];
      const orderByOptionsWithId: OrderByOptions = [{ field: 'id', direction: 'DESC' }];
      const orderByOptions: OrderByOptions = [
        { field: 'foo', direction: 'DESC' },
        { field: 'baz', direction: 'ASC' },
        { field: 'bar', direction: 'DESC' },
        { field: 'cuz', direction: 'DESC' }
      ];

      expect(getSortOrder()).toEqual('');
      expect(getSortOrder(orderByOptionsEmpty)).toEqual('');
      expect(getSortOrder(orderByOptions)).toEqual('-foo baz -bar -cuz');
      expect(getSortOrder(orderByOptionsWithId)).toEqual('-_id');
    });
  });

  describe('getQueryFilter', () => {

    it('should filter a query', async () => {

      const filters: PageArgsFilter[] = [{
        equalityKey: { eq: 'equalityValue' },
        nonEqualityKey: { ne: 'nonEqualityValue' },
        inKey: { in: ['firstInKeyValue', 'secondInKeyValue'] },
        containsKey: { contains: { value: 'containsValue' } },
        containsKeyWithOptions: {
          contains: {
            value: 'containsValue',
            options: 'i'
          }
        },
      }];

      const queryFilter = getQueryFilter(filters);

      expect(queryFilter).toEqual([{
        $and: [
          { equalityKey: { $eq: 'equalityValue' } },
          { nonEqualityKey: { $ne: 'nonEqualityValue' } },
          { inKey: { $in: ['firstInKeyValue', 'secondInKeyValue'] } },
          { containsKey: { $regex: 'containsValue', $options: '' } },
          { containsKeyWithOptions: { $regex: 'containsValue', $options: 'i' } }
        ]
      }]);
    });

    it('should allow an empty filter', async () => {
      const queryFilter = getQueryFilter([{}]);
      expect(queryFilter).toEqual([]);
    });
  });

  describe('decodeCursor', () => {

    it('should decode a cursor', () => {

      const objectId = Types.ObjectId();
      const encodedNumber = base64Encode('10');
      const encodedDocumentId = base64Encode(objectId.toHexString());

      expect(decodeCursor()).toEqual(null);
      expect(decodeCursor('invalid')).toEqual(null);
      expect(decodeCursor(encodedNumber)).toEqual(10);
      expect(decodeCursor(encodedDocumentId)).toEqual(objectId.toHexString());
    });
  });

  describe('getBeforeLimit', () => {

    it('should get a before limit', () => {

      const totalCount = 100;
      const beforeWithinBounds = 90;
      const beforeNegative = -100;
      const beforeOutOfBounds = 200;
      const beforeInvalid = 'invalid';

      expect(getBeforeLimit(beforeWithinBounds, totalCount)).toBe(beforeWithinBounds - 1);
      expect(getBeforeLimit(beforeNegative, totalCount)).toBe(beforeNegative - 1);
      expect(getBeforeLimit(beforeOutOfBounds, totalCount)).toBe(totalCount);
      expect(getBeforeLimit(beforeInvalid, totalCount)).toBe(totalCount);
    });
  });

  describe('getAfterSkip', () => {

    it('should get an after skip', () => {

      const afterWithinBounds = 10;
      const afterInvalid = 'invalid';

      expect(getAfterSkip(afterWithinBounds)).toBe(10);
      expect(getAfterSkip(afterInvalid)).toBe(0);
    });
  });

  describe('getLimit', () => {

    it('should get a limit', () => {

      const beforeCount = 90;
      const firstWithinBounds = 5;
      const firstOutOfBounds = beforeCount + 1;

      expect(getLimit(beforeCount)).toBe(beforeCount);
      expect(getLimit(beforeCount, firstWithinBounds)).toBe(firstWithinBounds);
      expect(getLimit(beforeCount, firstOutOfBounds)).toBe(beforeCount);
    });
  });

  describe('getSkip', () => {

    it('should get a skip', () => {

      const totalCount = 100;
      const afterCount = 10;
      const lastWithinBounds = 5;
      const lastOutOfBounds = 15;

      expect(getSkip(afterCount, totalCount)).toBe(90);
      expect(getSkip(afterCount, totalCount, lastWithinBounds)).toBe(95);
      expect(getSkip(afterCount, totalCount, lastOutOfBounds)).toBe(90);
    });
  });

  describe('getOffset', () => {

    it('should get an offset', () => {

      const id = Types.ObjectId().toHexString();

      expect(getOffset(null, 'BEFORE')).toEqual({});
      expect(getOffset(id, 'BEFORE')).toEqual({ _id: { $lt: id } });
      expect(getOffset(id, 'AFTER')).toEqual({ _id: { $gt: id } });
    });
  });

  describe('toPage', () => {

    it('should map query results to a page', () => {

      const firstId = Types.ObjectId().toHexString();
      const lastId = Types.ObjectId().toHexString();

      const nodes = [
        { id: firstId, foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: Types.ObjectId().toHexString(), foo: 'Foo' },
        { id: lastId, foo: 'Foo' }
      ];

      const result: PageQueryResult<any> = {
        afterCount: nodes.length,
        beforeCount: nodes.length,
        limit: nodes.length,
        skip: 0,
        totalCount: nodes.length,
        nodes
      };

      const page = toPage(result);
      const expected: Page<Document> = {
        totalCount: nodes.length,
        edges: result
          .nodes
          .map(node => ({
            node,
            cursor: base64Encode(node.id.toString())
          })),
        pageInfo: {
          startCursor: base64Encode(firstId),
          endCursor: base64Encode(lastId),
          hasPrevPage: false,
          hasNextPage: false
        }
      };

      expect(page).toEqual(expected);
    });

    it('should set the correct pageInfo.startCursor', () => {

      const firstId = Types.ObjectId().toHexString();
      const lastId = Types.ObjectId().toHexString();

      const nodes = [
        { id: firstId, foo: 'bar' },
        { id: lastId, foo: 'bar' }
      ];

      const result: PageQueryResult<any> = {
        afterCount: nodes.length,
        beforeCount: nodes.length,
        limit: nodes.length,
        skip: 0,
        totalCount: nodes.length,
        nodes
      };

      const page = toPage(result);
      expect(page.pageInfo.startCursor).toEqual(base64Encode(firstId));
    });

    it('should set the correct pageInfo.endCursor', () => {

      const firstId = Types.ObjectId().toHexString();
      const lastId = Types.ObjectId().toHexString();

      const nodes = [
        { id: firstId, foo: 'bar' },
        { id: lastId, foo: 'bar' }
      ];

      const result: PageQueryResult<any> = {
        afterCount: nodes.length,
        beforeCount: nodes.length,
        limit: nodes.length,
        skip: 0,
        totalCount: nodes.length,
        nodes
      };

      const page = toPage(result);
      expect(page.pageInfo.endCursor).toEqual(base64Encode(lastId));
    });

    it('should correctly set pageInfo.hasPrevPage', () => {

      const resultAfterCursor: PageQueryResult<any> = {
        afterCount: 8,
        totalCount: 10,
        beforeCount: 10,
        limit: 10,
        skip: 0,
        nodes: []
      };

      const resultSkip: PageQueryResult<any> = {
        afterCount: 10,
        totalCount: 10,
        beforeCount: 10,
        limit: 10,
        skip: 2,
        nodes: []
      };

      const pageAfterCursor = toPage(resultAfterCursor);
      const pageSkip = toPage(resultSkip);

      expect(pageAfterCursor.pageInfo.hasPrevPage).toBe(true);
      expect(pageSkip.pageInfo.hasPrevPage).toBe(true);
    });

    it('should correctly set pageInfo.hasNextPage', () => {

      const resultBeforeCursor: PageQueryResult<any> = {
        afterCount: 10,
        totalCount: 10,
        beforeCount: 8,
        limit: 10,
        skip: 0,
        nodes: []
      };

      const resultLimit: PageQueryResult<any> = {
        afterCount: 10,
        totalCount: 10,
        beforeCount: 10,
        limit: 8,
        skip: 0,
        nodes: []
      };

      const pageAfterCursor = toPage(resultBeforeCursor);
      const pageSkip = toPage(resultLimit);

      expect(pageAfterCursor.pageInfo.hasNextPage).toBe(true);
      expect(pageSkip.pageInfo.hasNextPage).toBe(true);
    });

    it('should use null as a cursor if a Mongoose Document has no ID', () => {

      const result: PageQueryResult<any> = {
        afterCount: 1,
        totalCount: 1,
        beforeCount: 1,
        limit: 1,
        skip: 0,
        nodes: [{ foo: 'bar' }]
      };

      const page = toPage(result);

      expect(page.pageInfo.startCursor).toBe(null);
      expect(page.pageInfo.endCursor).toBe(null);
      expect(page.edges[0].cursor).toBe(null);
    });
  });
});
