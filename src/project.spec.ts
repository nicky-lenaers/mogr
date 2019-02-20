import { mockServer } from 'graphql-tools';
import { Connection, createConnection } from 'mongoose';
import { complexRefCase } from '../jest/tc-complex-ref';
import { inlineFragmentCase } from '../jest/tc-inline-fragment';
import { nestedCase } from '../jest/tc-nested';
import { refCase } from '../jest/tc-ref';
import { simpleCase } from '../jest/tc-simple';
import { Registry } from './registry';

describe('project', () => {

  let connection: Connection;
  let registry: Registry;

  beforeAll(() => {
    connection = createConnection();
  });

  beforeEach(() => {
    registry = new Registry(connection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip GraphQL TypeName Fields', async () => {

    const tc = simpleCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      SimpleType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query simple {
        simple {
          __typename,
          foo,
          bar
        }
      }
    `);

    expect(projection).toBe('foo bar');
  });

  it('should handle GraphQL Fields', async () => {

    const tc = simpleCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      SimpleType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query simple {
        simple {
          foo,
          bar
        }
      }
    `);

    expect(projection).toBe('foo bar');
  });

  it('should handle offset GraphQL Fields', async () => {

    const tc = nestedCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      NestedType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName, tc.offset);
        return tc.response;
      }
    });

    await server.query(`
      query nested {
        nested {
          ${tc.offset} {
            foo,
            bar
          }
        }
      }
    `);

    expect(projection).toBe('foo bar');
  });

  it('should handle nested GraphQL Fields', async () => {

    const tc = refCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
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

    expect(projection).toBe('child');
  });

  it('should handle complex GraphQL Fields', async () => {

    const tc = complexRefCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      ComplexRefType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
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

    expect(projection).toBe('children.child children.baz.fiz bazzes');
  });

  it('should handle GraphQL Inline Fragments', async () => {

    const tc = inlineFragmentCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      BarType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query inlineFragment {
        inlineFragment {
          foo,
          ...on BarType {
            bar
          }
        }
      }
    `);

    expect(projection).toBe('foo bar');
  });

  it('should handle GraphQL Fragment Spreads', async () => {

    const tc = simpleCase(connection);
    let projection: string;

    const server = mockServer(tc.schema, {
      SimpleType: (...args) => {
        const info = args[args.length - 1];
        projection = registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query simple {
        simple {
          ...SimpleTypeFragment
        }
      }
      fragment SimpleTypeFragment on SimpleType {
        foo,
        bar
      }
    `);

    expect(projection).toBe('foo bar');
  });
});
