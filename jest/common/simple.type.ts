import { GraphQLObjectType, GraphQLString } from 'graphql';

export const simpleFields = {
  foo: {
    type: GraphQLString
  },
  bar: {
    type: GraphQLString
  }
}

export const SimpleType = new GraphQLObjectType({
  name: 'SimpleType',
  fields: () => ({
    ...simpleFields
  })
});
