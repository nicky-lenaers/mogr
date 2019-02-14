import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { mockServer } from 'graphql-tools';
import { Connection, createConnection } from 'mongoose';
import { nestedCase } from '../jest/tc-nested';
import { simpleCase } from '../jest/tc-simple';
import * as projectionModule from './project';
import { Registry } from './registry';
import { nestedRefCase } from '../jest/tc-nested-ref';
import { nestedSelfRefCase } from '../jest/tc-nested-self-ref';

describe('registry', () => {

  let connection: Connection;
  let registry: Registry;
  let getProjectionSpy: jest.Mock;

  beforeAll(() => {
    getProjectionSpy = jest
      .spyOn(projectionModule, 'getProjection')
      .mockImplementation(jest.fn());
  });

  beforeEach(() => {
    connection = createConnection();
    registry = new Registry(connection);
  });

  afterEach(() => {
    getProjectionSpy.mockReset();
  });

  it('should be able to be instantiated', () => {
    expect(registry).toBeTruthy();
  });

  it('should dynamically add Mongoose Models to the registry', async () => {

    const tc = nestedRefCase(connection);

    const server = mockServer(tc.schema, {
      NestedRefType: (...args) => {
        const info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query nestedRef {
        nestedRef {
          child {
            foo,
            bar
          }
        }
      }
    `);

    expect(registry.registryMap.size).toBe(2);
    expect(registry.registryMap.get(tc.parentModelName)).toBeTruthy();
    expect(registry.registryMap.get(tc.childModelName)).toBeTruthy();
  });

  it('should register each Mongoose Model only once', async () => {

    const tc = nestedSelfRefCase(connection);

    const server = mockServer(tc.schema, {
      NestedSelfRefType: (...args) => {
        const info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    for (let i = 0; i < 2; i++) {
      await server
        .query(`
          query nestedSelfRef {
            nestedSelfRef {
              foo,
              bar,
              self {
                foo,
                bar
              }
            }
          }
        `);
    }

    expect(registry.registryMap.size).toBe(1);
    expect(registry.registryMap.get(tc.modelName)).toBeTruthy();
  });

  it('should handle root path offset on nested fields', async () => {

    let info: GraphQLResolveInfo;

    const tc = nestedCase(connection);

    const server = mockServer(tc.schema, {
      NestedType: (...args) => {
        info = args[args.length - 1];
        registry.project(info, tc.model.modelName, tc.offset);
        return tc.response;
      }
    });

    await server.query(`
      query nested {
        nested {
          parent {
            foo,
            bar
          }
        }
      }
    `);

    const opFieldNode = info.operation.selectionSet.selections[0] as FieldNode;
    const offsetFieldNode = opFieldNode.selectionSet.selections
      .find(s => s.kind === 'Field' && s.name.value === tc.offset) as FieldNode;

    const { fragments } = info;

    expect(getProjectionSpy).toHaveBeenCalledWith(
      offsetFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      registry.registryMap
    );
  });

  it('should return selections on invalid root path offset', async () => {

    let info: GraphQLResolveInfo;

    const tc = nestedCase(connection);

    const server = mockServer(tc.schema, {
      NestedType: (...args) => {
        info = args[args.length - 1];
        registry.project(info, tc.model.modelName, `${tc.offset}-invalid`);
        return tc.response;
      }
    });

    await server.query(`
      query nested {
        nested {
          parent {
            foo,
            bar
          }
        }
      }
    `);

    const opFieldNode = info.operation.selectionSet.selections[0] as FieldNode;

    const { fragments } = info;

    expect(getProjectionSpy).toHaveBeenCalledWith(
      opFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      registry.registryMap
    );
  });

  it('should call getProjection on registry.project with correct arguments', async () => {

    let info: GraphQLResolveInfo;

    const fields = ['foo', 'bar'];
    const tc = simpleCase(connection);

    const server = mockServer(tc.schema, {
      SimpleType: (...args) => {
        info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    await server.query(`
      query simple {
        simple {
          ${fields.join(',')}
        }
      }
    `);

    const opFieldNode = info.operation.selectionSet.selections[0] as FieldNode;
    const { fragments } = info;

    expect(getProjectionSpy).toHaveBeenCalled();
    expect(getProjectionSpy).toHaveBeenCalledWith(
      opFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      registry.registryMap
    );
  });

  /** @todo finish tests */
  xit('should call gePopulation on register.populate with correct arguments', () => {

  });
});
