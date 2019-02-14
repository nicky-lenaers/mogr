import { Schema, Connection } from 'mongoose';
import { GraphQLObjectType, GraphQLString, GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { TestCase } from './tc';

interface NestedSelfRefCase extends TestCase {
  modelName: string;
}

const modelName = 'NestedSelfRefModel';

export const NestedSelfRefSchema = new Schema({
  self: {
    type: Schema.Types.ObjectId,
    ref: modelName
  },
  foo: {
    type: String
  },
  bar: {
    type: String
  }
});

export const nestedSelfRefResponse = {
  foo: 'Foo',
  bar: 'Bar',
  self: {
    foo: 'Foo',
    bar: 'Bar'
  }
};

export const NestedSelfRefType: GraphQLObjectType = new GraphQLObjectType({
  name: 'NestedSelfRefType',
  fields: () => ({
    foo: {
      type: GraphQLString
    },
    bar: {
      type: GraphQLString
    },
    self: {
      type: NestedSelfRefType
    }
  })
});

export const nestedSelfRef: GraphQLFieldConfig<object, any> = {
  type: NestedSelfRefType,
  resolve: () => nestedSelfRefResponse
}

export const nestedSelfRefSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'NestedSelfRefQueries',
    fields: () => ({
      nestedSelfRef
    })
  })
});

export function nestedSelfRefCase(connection: Connection): NestedSelfRefCase {

  const model = connection.model(
    modelName,
    NestedSelfRefSchema
  );

  return {
    model,
    response: nestedSelfRefResponse,
    schema: nestedSelfRefSchema,
    modelName
  }
}
