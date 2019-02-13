import { Schema, Connection, Document, Model } from 'mongoose';
import { GraphQLSchema, GraphQLFieldConfig, GraphQLObjectType, GraphQLString } from 'graphql';

export interface TestSet {
  model: Model<Document>;
  response: any;
  schema: GraphQLSchema;
}

export function simpleModel(connection: Connection): TestSet {

  const response = {
    foo: 'Foo',
    bar: 'Bar'
  }

  const TestSchema = new Schema({
    foo: {
      type: String
    },
    bar: {
      type: String
    }
  });

  const model = connection.model('TestModel', TestSchema, 'tests');

  const TestType: GraphQLObjectType = new GraphQLObjectType({
    name: 'TestType',
    fields: {
      foo: {
        type: GraphQLString
      },
      bar: {
        type: GraphQLString
      }
    }
  });

  const testQuery: GraphQLFieldConfig<object, any> = {
    type: TestType,
    resolve: () => response
  }

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'AllQueries',
      fields: {
        testQuery
      }
    })
  });

  return {
    model,
    response,
    schema
  };
}
