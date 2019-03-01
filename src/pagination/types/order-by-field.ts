import { GraphQLEnumType, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLNonNull, GraphQLObjectType } from 'graphql';

/**
 * Retrieve the Fields Enum Type.
 *
 * @param type            GraphQL Type
 * @returns               GraphQL Enum Type
 */
function FieldsEnumType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLEnumType {
  return new GraphQLEnumType({
    name: `FieldsEnum${type.name}`,
    values: Object
      .keys(type.getFields()).map(key => ({ [key]: { value: key } }))
      .reduce((acc, curr) => {
        acc = {
          ...curr,
          ...acc
        };
        return acc;
      }, {})
  });
}

/** Order By Direction Type */
const OrderByDirectionType = new GraphQLEnumType({
  name: 'OrderByDirection',
  values: {
    ASC: {
      value: 'ASC'
    },
    DESC: {
      value: 'DESC'
    }
  }
});

/**
 * Retrieve the Order By Direction Type.
 *
 * @param type          GraphQL Type
 * @returns             GraphQL Input Object Type
 */
export function OrderByFieldType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLInputObjectType {

  return new GraphQLInputObjectType({
    name: 'OrderByFieldType',
    fields: () => ({
      field: {
        type: new GraphQLNonNull(FieldsEnumType(type))
      },
      direction: {
        type: new GraphQLNonNull(OrderByDirectionType)
      }
    })
  });
}
