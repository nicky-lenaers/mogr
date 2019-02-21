import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { getParentModel } from './common/parent.model';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';
import { TestCase } from './tc';

interface NestedRefTestCase extends TestCase {
  root: string;
}

/**
 * A Nested Ref Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function nestedRefCase(connection: Connection): NestedRefTestCase {

  const root = 'root';
  const simpleModel = getSimpleModel(connection);
  const model = getParentModel(connection, simpleModel);

  const response = {
    [root]: {
      child: { ...simpleResponse }
    }
  }

  const NestedRefRootType = new GraphQLObjectType({
    name: 'NestedRefRootType',
    fields: () => ({
      [root]: {
        type: new GraphQLObjectType({
          name: 'NestedRefParentType',
          fields: () => ({
            child: {
              type: SimpleType
            }
          })
        })
      }
    })
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'NestedRefQueries',
      fields: () => ({
        nestedRef: {
          type: NestedRefRootType,
          resolve: () => response
        }
      })
    })
  });

  return {
    model,
    response,
    schema,
    root
  };
}
