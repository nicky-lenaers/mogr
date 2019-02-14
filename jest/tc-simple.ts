import { GraphQLFieldConfig, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { TestCase } from './tc';

export const simpleResponse = {
  foo: 'Foo',
  bar: 'Bar'
}

export const SimpleSchema = new Schema({
  foo: {
    type: String
  },
  bar: {
    type: String
  }
});

export const SimpleType: GraphQLObjectType = new GraphQLObjectType({
  name: 'SimpleType',
  fields: () => ({
    foo: {
      type: GraphQLString
    },
    bar: {
      type: GraphQLString
    }
  })
});

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

/**
 * A Simple Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function simpleCase(connection: Connection): TestCase {

  const model = connection
    .model(
      'SimpleModel',
      SimpleSchema,
      'simple'
    );

  return {
    model,
    response: simpleResponse,
    schema: simpleSchema
  };
}
