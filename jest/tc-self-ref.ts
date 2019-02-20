import { Schema, Connection } from 'mongoose';
import { GraphQLObjectType, GraphQLString, GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { TestCase } from './tc';

interface SelfRefTestCase extends TestCase {
  modelName: string;
}

const modelName = 'SelfRefModel';

export const SelfRefSchema = new Schema({
  self: {
    type: Schema.Types.ObjectId,
    ref: modelName
  },
  foo: {
    type: Schema.Types.String
  },
  bar: {
    type: Schema.Types.String
  }
});

export const selfRefResponse = {
  foo: 'Foo',
  bar: 'Bar',
  self: {
    foo: 'Foo',
    bar: 'Bar'
  }
};

export const SelfRefType: GraphQLObjectType = new GraphQLObjectType({
  name: 'SelfRefType',
  fields: () => ({
    foo: {
      type: GraphQLString
    },
    bar: {
      type: GraphQLString
    },
    self: {
      type: SelfRefType
    }
  })
});

export const selfRef: GraphQLFieldConfig<object, any> = {
  type: SelfRefType,
  resolve: () => selfRefResponse
}

export const selfRefSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'SelfRefQueries',
    fields: () => ({
      selfRef
    })
  })
});

export function selfRefCase(connection: Connection): SelfRefTestCase {

  const model = connection.model(
    modelName,
    SelfRefSchema
  );

  return {
    model,
    response: selfRefResponse,
    schema: selfRefSchema,
    modelName
  }
}
