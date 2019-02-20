import { GraphQLFieldConfig, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { TestCase } from './tc';
import { SimpleSchema, SimpleType } from './tc-simple';

interface NestedTestCase extends TestCase {
  offset: string;
}

const offset = 'parent';

export const nestedResponse = {
  [offset]: {
    foo: 'Foo',
    bar: 'Bar'
  }
}

export const NestedType: GraphQLObjectType = new GraphQLObjectType({
  name: 'NestedType',
  fields: () => ({
    [offset]: {
      type: SimpleType
    }
  })
});

export const nested: GraphQLFieldConfig<object, any> = {
  type: NestedType,
  resolve: () => nestedResponse
}

export const nestedSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'NestedQueries',
    fields: () => ({
      nested
    })
  })
});

/**
 * A Nested Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function nestedCase(connection: Connection): NestedTestCase {

  const model = connection.model(
    'SimpleSchema',
    SimpleSchema,
    'simple'
  );

  return {
    model,
    response: nestedResponse,
    schema: nestedSchema,
    offset
  };
}
