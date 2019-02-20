import { GraphQLFieldConfig, GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { TestCase } from './tc';

export const InlineFragmentSchema = new Schema({
  foo: {
    type: String
  },
  bar: {
    type: String
  }
});

const BarType = new GraphQLObjectType({
  name: 'BarType',
  interfaces: () => [FooBaseType],
  fields: () => ({
    foo: {
      type: GraphQLString
    },
    bar: {
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

export const inlineFragmentResponse = {
  foo: 'Foo',
  bar: 'Bar'
}

export const inlineFragment: GraphQLFieldConfig<object, any> = {
  type: FooBaseType,
  resolve: () => inlineFragmentResponse
}

export const inlineFragmentSchema = new GraphQLSchema({
  types: [
    FooBaseType,
    BarType
  ],
  query: new GraphQLObjectType({
    name: 'InlineFragmentQueries',
    fields: () => ({
      inlineFragment
    })
  })
});

/**
 * An Inline Fragment Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function inlineFragmentCase(connection: Connection): TestCase {

  const model = connection.model(
    'InlineFragmentSchema',
    InlineFragmentSchema,
    'inline-fragment'
  );

  return {
    model,
    response: inlineFragmentResponse,
    schema: inlineFragmentSchema
  };
}
