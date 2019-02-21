import { GraphQLInterfaceType, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { getParentModel } from './common/parent.model';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';
import { TestCase } from './tc';

export function inlineFragmentRefCase(connection: Connection): TestCase {

  const simpleModel = getSimpleModel(connection);
  const model = getParentModel(connection, simpleModel);

  const response = {
    child: { ...simpleResponse }
  }

  const BarType = new GraphQLObjectType({
    name: 'BarType',
    interfaces: () => [FooBaseType],
    fields: () => ({
      child: {
        type: SimpleType
      }
    })
  });

  const FooBaseType = new GraphQLInterfaceType({
    name: 'FooBaseType',
    fields: () => ({
      child: {
        type: SimpleType
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
      name: 'InlineFragRefmentQueries',
      fields: () => ({
        inlineFragmentRef: {
          type: FooBaseType,
          resolve: () => simpleResponse
        }
      })
    })
  });

  return {
    model,
    response,
    schema
  };
}
