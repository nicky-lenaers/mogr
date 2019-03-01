import { GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLObjectType, GraphQLString } from 'graphql';
import { OrderByFieldType } from './order-by-field';

/**
 * Query Options Factory.
 *
 * @param type       GraphQL Type
 * @returns          GraphQL Input Object Type
 */
export function QueryOptionsType(type: GraphQLInterfaceType | GraphQLObjectType): GraphQLInputObjectType {

  const queryOptions: GraphQLInputFieldConfigMap = {
    first: {
      type: GraphQLInt
    },
    last: {
      type: GraphQLInt
    },
    before: {
      type: GraphQLString
    },
    after: {
      type: GraphQLString
    },
    orderBy: {
      type: new GraphQLList(OrderByFieldType(type))
    }
  };

  return new GraphQLInputObjectType({
    name: `QueryOptions${type.name}`,
    fields: () => (queryOptions)
  });
}
