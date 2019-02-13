import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { mockServer } from 'graphql-tools';
import { Connection, createConnection } from 'mongoose';
import { simpleModel, TestSet } from '../jest/models';
import * as projectionModule from './project';
import { Registry } from './registry';

describe('registry', () => {

  let connection: Connection;
  let registry: Registry;
  let testSet: TestSet;

  const fields = ['foo', 'bar'];

  beforeAll(() => {
    connection = createConnection();
    testSet = simpleModel(connection);
    registry = new Registry(connection);
  });

  it('should be able to be instantiated', () => {
    expect(registry).toBeTruthy();
  });

  it('should use getProjection on registry.project', async () => {

    let info: GraphQLResolveInfo;

    const spy = jest.spyOn(projectionModule, 'getProjection');
    const server = mockServer(testSet.schema, {
      String: (...args) => {
        info = args[args.length - 1];
        registry.project(info, testSet.model.modelName);
        return testSet.response;
      }
    });

    await server.query(`
      query testQuery {
        testQuery {
          ${fields.join(',')}
        }
      }
    `);

    const operationSelection = info.operation.selectionSet.selections[0] as FieldNode;
    const { fragments } = info;

    expect(spy).toHaveBeenCalled();
    expect(spy).toBeCalledWith(
      operationSelection.selectionSet.selections,
      fragments,
      testSet.model.modelName,
      registry.registryMap
    );
  });

  /** @todo(now) finish tests */
  it('should handle root path offet', () => {

  });

  it('should recurse on nested schema fields', () => {

  });

  it('should use gePopulation on register.populate', () => {

  });

  it('should dynamically add unregistered models to the registry', () => {

  });
})
