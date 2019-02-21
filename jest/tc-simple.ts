import { GraphQLFieldConfig, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';
import { TestCase } from './tc';

/**
 * A Simple Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function simpleCase(connection: Connection): TestCase {

  const simple: GraphQLFieldConfig<object, any> = {
    type: SimpleType,
    resolve: () => simpleResponse
  }

  const simpleSchema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'SimpleQueries',
      fields: () => ({
        simple
      })
    })
  });

  const model = getSimpleModel(connection);

  return {
    model,
    response: simpleResponse,
    schema: simpleSchema
  };
}
