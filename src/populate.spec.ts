import { mockServer } from 'graphql-tools';
import { Connection, createConnection, ModelPopulateOptions } from 'mongoose';
import { complexRefCase } from '../jest/tc-complex-ref';
import { refCase } from '../jest/tc-ref';
import { refSelected } from '../jest/tc-ref-selected';
import { inlineFragmentRefCase } from '../jest/ts-inline-fragment-ref';
import { Registry } from './registry';

describe('populate', () => {

  let connection: Connection;
  let registry: Registry;

  beforeEach(() => {
    connection = createConnection();
    registry = new Registry(connection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip GraphQL TypeName Fields', async () => {

    const tc = refCase(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query ref {
        ref {
          child {
            __typename,
            foo,
            bar
          }
        }
      }
    `);

    expect(population).toEqual([{ path: 'child', populate: [], select: ['id', 'foo', 'bar'] }]);
  });

  it('should handle GraphQL Fields', async () => {

    const tc = refCase(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query ref {
        ref {
          child {
            foo,
            bar
          }
        }
      }
    `);

    expect(population).toEqual([{ path: 'child', populate: [], select: ['id', 'foo', 'bar'] }]);
  });

  it('should handle complex GraphQL Fields', async () => {

    const tc = complexRefCase(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      ComplexRefType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query complexRef {
        complexRef {
          children {
            child {
              foo,
              bar,
              child {
                foo,
                bar,
                baz { fiz }
              },
              baz { fiz }
            },
            baz { fiz }
          },
          bazzes {
            fiz
          }
        }
      }
    `);

    expect(population).toEqual([
      {
        path: 'children.child',
        populate: [
          {
            path: 'doo',
            select: ['id', 'cuzzes', '__t']
          },
          {
            path: 'bazzes',
            select: ['id']
          },
          {
            path: 'child',
            populate: [
              {
                path: 'doo',
                select: ['id', 'cuzzes', '__t']
              },
              {
                path: 'bazzes',
                select: ['id']
              }
            ],
            select: ['id', 'cuzzes', '__t', 'foo', 'bar', 'baz.fiz']
          }
        ],
        select: ['id', 'cuzzes', '__t', 'foo', 'bar', 'baz.fiz']
      },
      {
        path: 'bazzes',
        populate: [],
        select: ['id', 'fiz']
      }
    ]);
  });

  it('should handle GraphQL Inline Fragments', async () => {

    const tc = inlineFragmentRefCase(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      BarType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query inlineFragmentRef {
        inlineFragmentRef {
          ...on BarType {
            child {
              foo,
              bar
            }
          }
        }
      }
    `);

    expect(population).toEqual([{ path: 'child', populate: [], select: ['id', 'foo', 'bar'] }]);
  });

  it('should handle GraphQL Fragment Spreads', async () => {

    const tc = refCase(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query ref {
        ref {
          child {
            ...SimpleTypeFragment
          }
        }
      },
      fragment SimpleTypeFragment on SimpleType {
        foo,
        bar
      }
    `);

    expect(population).toEqual([{ path: 'child', populate: [], select: ['id', 'foo', 'bar'] }]);
  });

  it('should include fields selected by the Mongoose Schema', async () => {

    const tc = refSelected(connection);
    let population: ModelPopulateOptions[];

    const server = mockServer(tc.schema, {
      RefSelectedType: (...args) => {
        const info = args[args.length - 1];
        population = registry.populate(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query refSelected {
        refSelected {
          child {
            foo,
            bar
          }
        }
      }
    `);

    expect(population).toEqual([{ path: 'child', populate: [], select: ['id', 'baz', '__t', 'foo', 'bar'] }]);
  });

});
