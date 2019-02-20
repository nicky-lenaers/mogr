import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { mockServer } from 'graphql-tools';
import { Connection, createConnection } from 'mongoose';
import { complexRefCase } from '../jest/tc-complex-ref';
import { nestedCase } from '../jest/tc-nested';
import { refCase } from '../jest/tc-ref';
import { selfRefCase } from '../jest/tc-self-ref';
import { simpleCase } from '../jest/tc-simple';
import * as populationModule from './populate';
import * as projectionModule from './project';
import { Registry } from './registry';

describe('registry', () => {

  let connection: Connection;
  let registry: Registry;
  let getProjectionSpy: jest.Mock;
  let getPopulationSpy: jest.Mock;

  beforeAll(() => {

    connection = createConnection();

    getProjectionSpy = jest
      .spyOn(projectionModule, 'getProjection')
      .mockImplementation((...args) => '');

    getPopulationSpy = jest
      .spyOn(populationModule, 'getPopulation')
      .mockImplementation((...args) => []);
  });

  beforeEach(() => {
    registry = new Registry(connection);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be newable', () => {
    expect(registry).toBeTruthy();
  });

  it('should dynamically add Mongoose Models to the registry', async () => {

    const tc = refCase(connection);

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        const info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
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

    expect(registry.registryMap.size).toBe(2);
    expect(registry.registryMap.get(tc.parentModelName)).toBeTruthy();
    expect(registry.registryMap.get(tc.childModelName)).toBeTruthy();
  });

  it('should register each Mongoose Model only once', async () => {

    const tc = selfRefCase(connection);

    const server = mockServer(tc.schema, {
      SelfRefType: (...args) => {
        const info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
        return tc.response;
      }
    });

    for (let i = 0; i < 2; i++) {
      await server
        .query(`
          query selfRef {
            selfRef {
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
        registry.populate(info, tc.model.modelName, tc.offset);
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

    expect(getPopulationSpy).toHaveBeenCalledWith(
      offsetFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      connection,
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

  it('should get dotified populatable fields from a complex Mongoose Model', async () => {

    const tc = complexRefCase(connection);

    const server = mockServer(tc.schema, {
      ComplexRefType: (...args) => {
        const info = args[args.length - 1];
        registry.project(info, tc.model.modelName);
        registry.populate(info, tc.model.modelName);
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

    expect(registry.registryMap.get(tc.parentModelName)[0].path).toBe('children.child');
    expect(registry.registryMap.get(tc.parentModelName)[1].path).toBe('bazzes');
    expect(registry.registryMap.get(tc.childModelName)[0].path).toBe('child');
  });

  it('should call getProjection on registry.project with correct arguments', async () => {

    let info: GraphQLResolveInfo;

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
          foo,
          bar
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

  it('should call getPopulation on register.populate with correct arguments', async () => {

    let info: GraphQLResolveInfo;

    const tc = refCase(connection);

    const server = mockServer(tc.schema, {
      RefType: (...args) => {
        info = args[args.length - 1];
        registry.populate(info, tc.model.modelName);
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

    const opFieldNode = info.operation.selectionSet.selections[0] as FieldNode;
    const { fragments } = info;

    expect(getPopulationSpy).toHaveBeenCalled();
    expect(getPopulationSpy).toHaveBeenCalledWith(
      opFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      connection,
      registry.registryMap
    );
  });
});
