import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Connection } from 'mongoose';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { simpleFields } from './common/simple.type';
import { TestCase } from './tc';

/**
 * An Inline Fragment Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function inlineFragmentCase(connection: Connection): TestCase {

  const model = getSimpleModel(connection);

  const BarType = new GraphQLObjectType({
    name: 'BarType',
    interfaces: () => [FooBaseType],
    fields: () => ({
      ...simpleFields,
      baz: {
        type: GraphQLString
      }
    })
  });

  const FooBaseType = new GraphQLInterfaceType({
    name: 'FooBaseType',
    fields: () => ({
      foo: {
        type: GraphQLString
      }
    }),
    resolveType: () => BarType
  });

  const schema = new GraphQLSchema({
    types: [
      FooBaseType,
      BarType
    ],
    query: new GraphQLObjectType({
      name: 'InlineFragmentQueries',
      fields: () => ({
        inlineFragment: {
          type: FooBaseType,
          resolve: () => simpleResponse
        }
      })
    })
  });

  return {
    model,
    response: simpleResponse,
    schema
  };
}
