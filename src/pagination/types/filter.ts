import { GraphQLInputFieldConfigMap, GraphQLInputObjectType, GraphQLInterfaceType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString, GraphQLType } from 'graphql';

/** Filter Contains Type */
const FilterContainsType = new GraphQLInputObjectType({
  name: 'FilterContainsType',
  fields: {
    value: {
      type: GraphQLString
    },
    options: {
      type: GraphQLString
    }
  }
});

/** String Fields */
const StringFields: GraphQLInputFieldConfigMap = {
  contains: {
    type: FilterContainsType
  },
  eq: {
    type: GraphQLString
  },
  in: {
    type: new GraphQLList(GraphQLString)
  },
  ne: {
    type: GraphQLString
  }
};

/**
 * Filter Type Factory
 *
 * @param type          GraphQL Type
 * @returns
 */
export function FilterType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLList<GraphQLType> {

  return new GraphQLList(new GraphQLInputObjectType({
    name: `Filter${type.name}`,
    fields: () => (Object
      .entries(type.getFields())
      .map(field => {

        const [name, value] = field;
        const filters: GraphQLInputFieldConfigMap = {};

        const valueType = value.type instanceof GraphQLNonNull
          ? value.type.ofType
          : value.type;

        switch (valueType.toString()) {
          case GraphQLString.name: {
            filters[name] = {
              type: new GraphQLInputObjectType({
                name: `Filter${name.charAt(0).toUpperCase() + name.slice(1)}${type.name}`,
                fields: () => ({ ...StringFields })
              })
            };
          }
        }

        return filters;
      })
      .reduce((acc, curr) => {
        acc = { ...acc, ...curr };
        return acc;
      }, {})
    )
  }));
}
