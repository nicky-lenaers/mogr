import { createConnection, Document, DocumentQuery, ModelPopulateOptions, Query, Types } from 'mongoose';
import { simpleCase } from '../../jest/tc-simple';
import * as helpersModule from './helpers';
import { EMPTY_PAGE, queryPage } from './query-page';
import { PageArgs } from './types/page-args';
import { base64Encode } from './utils';

describe('queryPage', () => {

  let query: DocumentQuery<Document[], Document>;
  let countDocumentsQuery: Query<number>;
  let getQueryFilterSpy: jest.SpyInstance;
  let getSortOrderSpy: jest.SpyInstance;
  let totalCount: number = 10;

  beforeAll(() => {
    const connection = createConnection();
    const tc = simpleCase(connection);
    query = tc.model.find();

    getQueryFilterSpy = jest.spyOn(helpersModule, 'getQueryFilter');
    getSortOrderSpy = jest.spyOn(helpersModule, 'getSortOrder');

    countDocumentsQuery = new Query<number>();

    jest.spyOn(Query.prototype, 'toConstructor').mockImplementation(() => Query);
    jest.spyOn(Query.prototype, 'countDocuments').mockImplementation(() => countDocumentsQuery);
    jest.spyOn(countDocumentsQuery, 'exec').mockImplementation(() => new Promise(res => res(totalCount)));
    jest.spyOn(Query.prototype, 'exec').mockImplementation(() => new Promise(res => res([])));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an empty page if queryOptions.first is zero', async () => {

    const args: PageArgs = { queryOptions: { first: 0 } };
    const page = await queryPage(query, args);

    expect(page).toEqual(EMPTY_PAGE);
  });

  it('should return an empty page if queryOptions.last is zero', async () => {

    const args: PageArgs = { queryOptions: { last: 0 } };
    const page = await queryPage(query, args);

    expect(page).toEqual(EMPTY_PAGE);
  });

  it('should return an empty page if totalCount is zero', async () => {

    jest.spyOn(countDocumentsQuery, 'exec').mockImplementation(() => new Promise(res => res(0)));

    const page = await queryPage(query, {});

    expect(page).toEqual(EMPTY_PAGE);
  });

  it('should return an empty page if before is less than or equal to one', async () => {

    jest.spyOn(countDocumentsQuery, 'exec').mockImplementation(() => new Promise(res => res(10)));

    const args: PageArgs = {
      queryOptions: {
        before: base64Encode('1')
      }
    };

    const page = await queryPage(query, args);

    expect(page).toEqual(EMPTY_PAGE);
  });

  it('should return an empty page if after is greater than totalCount', async () => {

    jest.spyOn(countDocumentsQuery, 'exec').mockImplementation(() => new Promise(res => res(totalCount)));

    const args: PageArgs = {
      queryOptions: {
        after: base64Encode(`${totalCount + 1}`)
      }
    };

    const page = await queryPage(query, args);

    expect(page).toEqual(EMPTY_PAGE);
  });

  it('should throw on an invalid before cursor', async () => {

    const args: PageArgs = {
      queryOptions: {
        before: 'invalidCursor'
      }
    };

    await expect(queryPage(query, args)).rejects.toThrowError();
  });

  it('should throw on an invalid after cursor', async () => {

    const args: PageArgs = {
      queryOptions: {
        after: 'invalidCursor'
      }
    };

    await expect(queryPage(query, args)).rejects.toThrow();
  });

  it('should apply filtering to a query', async () => {

    const orSpy = jest.spyOn(Query.prototype, 'or');
    const args: PageArgs = {
      filters: [{
        foo: {
          eq: 'bar'
        }
      }]
    };

    await queryPage(query, args);

    expect(getQueryFilterSpy).toHaveBeenCalledWith(args.filters);
    expect(orSpy).toHaveBeenCalledWith([{ $and: [{ foo: { $eq: 'bar' } }] }]);
  });

  it('should apply sorting to a query', async () => {

    const sortSpy = jest.spyOn(Query.prototype, 'sort');
    const args: PageArgs = {
      queryOptions: {
        orderBy: [
          { field: 'foo', direction: 'ASC' },
          { field: 'bar', direction: 'DESC' }
        ]
      }
    };

    await queryPage(query, args);

    expect(getSortOrderSpy).toHaveBeenCalledWith(args.queryOptions.orderBy);
    expect(sortSpy).toHaveBeenCalledWith('foo -bar');
  });

  it('should get an ID offset from the before cursor', async () => {

    const whereSpy = jest.spyOn(Query.prototype, 'where');
    const id = Types.ObjectId().toHexString();

    const args: PageArgs = {
      queryOptions: {
        before: base64Encode(id)
      }
    };

    await queryPage(query, args);

    expect(whereSpy).toHaveBeenCalledWith({ _id: { $lt: id } });
  });

  it('should get an ID offset from the after cursor', async () => {

    const whereSpy = jest.spyOn(Query.prototype, 'where');
    const id = Types.ObjectId().toHexString();

    const args: PageArgs = {
      queryOptions: {
        after: base64Encode(id)
      }
    };

    await queryPage(query, args);

    expect(whereSpy).toHaveBeenCalledWith({ _id: { $gt: id } });
  });

  it('should apply a query limit from the before cursor', async () => {

    const countQuery = new Query<number>();
    const beforeCount = 5;
    const lastCount = 3;
    let i = 0;

    const limitSpy = jest.spyOn(Query.prototype, 'limit');
    const getLimitSpy = jest.spyOn(helpersModule, 'getLimit').mockReturnValue(beforeCount);

    jest.spyOn(helpersModule, 'toPage').mockImplementation(() => EMPTY_PAGE);
    jest.spyOn(helpersModule, 'getBeforeLimit').mockReturnValue(beforeCount);
    jest.spyOn(Query.prototype, 'toConstructor').mockImplementation(() => Query);
    jest.spyOn(Query.prototype, 'countDocuments').mockImplementation(() => countQuery);
    jest.spyOn(countQuery, 'exec').mockImplementation(() => {
      switch (i) {
        case 0: {
          i++;
          return new Promise(res => res(10));
        };
        case 1: {
          i++;
          return new Promise(res => res(beforeCount));
        }
      };
    });

    const args: PageArgs = {
      queryOptions: {
        before: base64Encode(Types.ObjectId().toHexString()),
        last: lastCount
      }
    };

    await queryPage(query, args);

    expect(getLimitSpy).toHaveBeenCalledWith(beforeCount, lastCount);
    expect(limitSpy).toHaveBeenCalledWith(beforeCount);
  });

  it('should apply a query skip from the after cursor', async () => {

    const countQuery = new Query<number>();
    const afterCount = 5;
    const lastCount = 3;
    let i = 0;

    const skipSpy = jest.spyOn(Query.prototype, 'skip');
    const getSkipSpy = jest.spyOn(helpersModule, 'getSkip').mockReturnValue(afterCount);

    jest.spyOn(helpersModule, 'toPage').mockImplementation(() => EMPTY_PAGE);
    jest.spyOn(helpersModule, 'getAfterSkip').mockReturnValue(afterCount);
    jest.spyOn(Query.prototype, 'toConstructor').mockImplementation(() => Query);
    jest.spyOn(Query.prototype, 'countDocuments').mockImplementation(() => countQuery);
    jest.spyOn(countQuery, 'exec').mockImplementation(() => {
      switch (i) {
        case 0: {
          i++;
          return new Promise(res => res(10));
        };
        case 1: {
          i++; return new Promise(res => res(afterCount));
        }
        case 2: {
          i++;
          return new Promise(res => res(afterCount));
        }
      };
    });

    const args: PageArgs = {
      queryOptions: {
        after: base64Encode(Types.ObjectId().toHexString()),
        last: lastCount
      }
    };

    await queryPage(query, args);

    expect(getSkipSpy).toHaveBeenCalledWith(afterCount, totalCount, lastCount);
    expect(skipSpy).toHaveBeenCalledWith(afterCount);
  });

  it('should apply population to a query', async () => {

    const populateSpy = jest.spyOn(Query.prototype, 'populate');
    const population: ModelPopulateOptions[] = [
      { path: 'foo', select: ['bar'] },
      { path: 'baz' }
    ];

    await queryPage(query, {}, '', population);

    expect(populateSpy).toHaveBeenCalledTimes(2);
    expect(populateSpy).toHaveBeenNthCalledWith(1, { path: 'foo', select: ['bar'] });
    expect(populateSpy).toHaveBeenNthCalledWith(2, { path: 'baz' });
  });
});
