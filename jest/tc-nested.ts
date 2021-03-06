import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';
import { TestCase } from './tc';

interface NestedTestCase extends TestCase {
  root: string;
}

/**
 * A Nested Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function nestedCase(connection: Connection): NestedTestCase {

  const root = 'root';
  const model = getSimpleModel(connection);

  const response = {
    [root]: { ...simpleResponse }
  };

  const NestedRootType: GraphQLObjectType = new GraphQLObjectType({
    name: 'NestedRootType',
    fields: () => ({
      [root]: {
        type: SimpleType
      }
    })
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'NestedQueries',
      fields: () => ({
        nested: {
          type: NestedRootType,
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
