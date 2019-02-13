import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { mockServer } from 'graphql-tools';
import { Connection, createConnection } from 'mongoose';
import { nestedCase } from '../jest/tc-nested';
import { simpleCase } from '../jest/tc-simple';
import * as projectionModule from './project';
import { Registry } from './registry';

describe('registry', () => {

  let connection: Connection;
  let registry: Registry;

  beforeEach(() => {
    connection = createConnection();
    registry = new Registry(connection);
  });

  it('should be able to be instantiated', () => {
    expect(registry).toBeTruthy();
  });

  it('should use getProjection on registry.project', async () => {

    let info: GraphQLResolveInfo;

    const fields = ['foo', 'bar'];
    const tc = simpleCase(connection);
    const spy = jest
      .spyOn(projectionModule, 'getProjection')
      .mockImplementation(jest.fn());

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

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      opFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      registry.registryMap
    );
  });

  it('should handle root path offset for projection', async () => {

    let info: GraphQLResolveInfo;

    const tc = nestedCase(connection);

    const spy = jest
      .spyOn(projectionModule, 'getProjection')
      .mockImplementation(jest.fn());

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

    expect(spy).toHaveBeenCalledWith(
      offsetFieldNode.selectionSet.selections,
      fragments,
      tc.model.modelName,
      registry.registryMap
    );
  });

  /** @todo finish tests */
  xit('should use gePopulation on register.populate', () => {

  });

  xit('should handle root path offset for population', async () => {

  });

  xit('should dynamically add unregistered models to the registry', () => {

  });
})
