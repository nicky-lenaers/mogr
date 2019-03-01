import { GraphQLInputObjectType, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInterfaceType } from 'graphql';
import { mockServer } from 'graphql-tools';
import { OrderByFieldType } from './order-by-field';

describe('OrderByFieldType', () => {

  it('should construct a correct Order By Field Type from a GraphQL Object Type', async () => {

    const TestType = new GraphQLObjectType({
      name: 'TestType',
      fields: () => ({
        foo: { type: GraphQLString },
        bar: { type: new GraphQLNonNull(GraphQLString) }
      })
    });

    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'TestQueries',
        fields: () => ({
          testOrderBy: {
            type: TestType,
            args: {
              queryOptions: {
                type: new GraphQLInputObjectType({
                  name: 'QueryOptionsType',
                  fields: () => ({
                    orderBy: {
                      type: new GraphQLList(OrderByFieldType(TestType))
                    }
                  })
                })
              }
            }
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server.query(`
      query testOrderBy($queryOptions: QueryOptionsType) {
        testOrderBy(queryOptions: $queryOptions) {
          foo,
          bar
        }
      }
    `, { queryOptions: { orderBy: [{ field: 'foo', direction: 'ASC' }] } });

    expect(res).toEqual({ data: { testOrderBy: response } });
  });

  it('should construct a correct Order By Field Type from a GraphQL Interface Type', async () => {

    const TestInterfaceType = new GraphQLInterfaceType({
      name: 'TestInterfaceType',
      fields: () => ({
        foo: { type: GraphQLString },
        bar: { type: new GraphQLNonNull(GraphQLString) }
      }),
      resolveType: () => TestType
    });

    const TestType = new GraphQLObjectType({
      name: 'TestType',
      interfaces: () => [TestInterfaceType],
      fields: () => ({
        foo: { type: GraphQLString },
        bar: { type: new GraphQLNonNull(GraphQLString) }
      })
    });

    const schema = new GraphQLSchema({
      types: [
        TestInterfaceType,
        TestType
      ],
      query: new GraphQLObjectType({
        name: 'TestQueries',
        fields: () => ({
          testOrderBy: {
            type: TestInterfaceType,
            args: {
              queryOptions: {
                type: new GraphQLInputObjectType({
                  name: 'QueryOptionsType',
                  fields: () => ({
                    orderBy: {
                      type: new GraphQLList(OrderByFieldType(TestType))
                    }
                  })
                })
              }
            }
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server.query(`
      query testOrderBy($queryOptions: QueryOptionsType) {
        testOrderBy(queryOptions: $queryOptions) {
          foo,
          bar
        }
      }
    `, { queryOptions: { orderBy: [{ field: 'foo', direction: 'ASC' }] } });

    expect(res).toEqual({ data: { testOrderBy: response } });
  });
});
