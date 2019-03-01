import { GraphQLBoolean, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

/**
 * Page Edge Type Factory
 *
 * @param type        Base Type
 * @returns
 */
function EdgeType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLObjectType {
  return new GraphQLObjectType({
    name: `Edged${type.name}`,
    fields: () => ({
      node: {
        type
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString)
      }
    })
  });
}

/** Page Info Type */
const PageInfoType = new GraphQLObjectType({
  name: 'PageInfoType',
  fields: () => ({
    startCursor: {
      type: GraphQLString
    },
    endCursor: {
      type: GraphQLString
    },
    hasPrevPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    },
    hasNextPage: {
      type: new GraphQLNonNull(GraphQLBoolean)
    }
  })
});

/**
 * Page Type Factory
 *
 * @param type        Base Type
 * @returns           GraphQL Object Type
 */
export function PageType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLObjectType {

  return new GraphQLObjectType({
    name: `Paginated${type.name}`,
    fields: () => ({
      totalCount: {
        type: new GraphQLNonNull(GraphQLInt)
      },
      edges: {
        type: new GraphQLList(EdgeType(type))
      },
      pageInfo: {
        type: new GraphQLNonNull(PageInfoType)
      }
    })
  });
}
