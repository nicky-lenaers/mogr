import { Schema, Connection } from 'mongoose';
import { TestCase } from './tc';
import { GraphQLObjectType, GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { SimpleType } from './tc-simple';

interface NestedRefTestCase extends TestCase {
  parentModelName: string;
  childModelName: string;
}

const parentModelName = 'NestedRefParentModel';
const childModelName = 'NestedRefChildModel';

export const NestedRefParentSchema = new Schema({
  child: {
    type: Schema.Types.ObjectId,
    ref: childModelName
  }
});

export const NestedRefChildSchema = new Schema({
  foo: {
    type: String
  },
  bar: {
    type: String
  }
});

export const nestedRefResponse = {
  child: {
    foo: 'Foo',
    bar: 'Bar'
  }
};

export const NestedRefType: GraphQLObjectType = new GraphQLObjectType({
  name: 'NestedRefType',
  fields: () => ({
    child: {
      type: SimpleType
    }
  })
});

export const nestedRef: GraphQLFieldConfig<object, any> = {
  type: NestedRefType,
  resolve: () => nestedRefResponse
}

export const nestedRefSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'NestedRefQueries',
    fields: () => ({
      nestedRef
    })
  })
});

export function nestedRefCase(connection: Connection): NestedRefTestCase {

  const parentModel = connection.model(
    parentModelName,
    NestedRefParentSchema,
    'nested-ref'
  );

  connection.model(
    childModelName,
    NestedRefChildSchema,
    'nested-ref'
  );

  return {
    model: parentModel,
    response: nestedRefResponse,
    schema: nestedRefSchema,
    parentModelName,
    childModelName
  };
}
