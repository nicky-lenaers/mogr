import { Schema, Connection } from 'mongoose';
import { TestCase } from './tc';
import { GraphQLObjectType, GraphQLFieldConfig, GraphQLSchema } from 'graphql';
import { SimpleType } from './tc-simple';

interface RefTestCase extends TestCase {
  parentModelName: string;
  childModelName: string;
}

const parentModelName = 'RefParentModel';
const childModelName = 'RefChildModel';

export const RefParentSchema = new Schema({
  child: {
    type: Schema.Types.ObjectId,
    ref: childModelName
  }
});

export const RefChildSchema = new Schema({
  foo: {
    type: Schema.Types.String
  },
  bar: {
    type: Schema.Types.String
  }
});

export const refResponse = {
  child: {
    foo: 'Foo',
    bar: 'Bar'
  }
};

export const RefType: GraphQLObjectType = new GraphQLObjectType({
  name: 'RefType',
  fields: () => ({
    child: {
      type: SimpleType
    }
  })
});

export const ref: GraphQLFieldConfig<object, any> = {
  type: RefType,
  resolve: () => refResponse
}

export const refSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RefQueries',
    fields: () => ({
      ref
    })
  })
});

/**
 * A Ref Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function refCase(connection: Connection): RefTestCase {

  const parentModel = connection.model(
    parentModelName,
    RefParentSchema,
    'ref'
  );

  connection.model(
    childModelName,
    RefChildSchema,
    'ref'
  );

  return {
    model: parentModel,
    response: refResponse,
    schema: refSchema,
    parentModelName,
    childModelName
  };
}
