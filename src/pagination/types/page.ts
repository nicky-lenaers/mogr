import { GraphQLBoolean, GraphQLInt, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

type FromType = GraphQLObjectType | GraphQLInterfaceType;

interface FromTypeOptions {
  pageTypeName?: string;
  edgeTypeName?: string;
}

/**
 * Page Edge Type Factory
 *
 * @param type        From Type
 * @returns           GraphQL Object Type
 */
export function EdgeType(type: FromType, options?: FromTypeOptions): GraphQLObjectType {
  return new GraphQLObjectType({
    name: options && options.edgeTypeName ? options.edgeTypeName : `Edged${type.name}`,
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
export function PageType(type: FromType, options?: FromTypeOptions): GraphQLObjectType {

  return new GraphQLObjectType({
    name: options && options.pageTypeName ? options.pageTypeName : `Paginated${type.name}`,
    fields: () => ({
      totalCount: {
        type: new GraphQLNonNull(GraphQLInt)
      },
      edges: {
        type: new GraphQLList(EdgeType(type, options))
      },
      pageInfo: {
        type: new GraphQLNonNull(PageInfoType)
      }
    })
  });
}
