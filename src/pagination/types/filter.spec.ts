import { GraphQLInterfaceType, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { mockServer } from 'graphql-tools';
import { FilterType } from './filter';

describe('FilterType', () => {

  it('should construct a correct Filter Type from a GraphQL Object Type', async () => {

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
          testFilter: {
            type: TestType,
            args: {
              filters: { type: FilterType(TestType) }
            }
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server.query(`
      query testFilter($filters: [FilterTestType]) {
        testFilter(filters: $filters) {
          foo,
          bar
        }
      }
    `, { filters: [{ foo: { eq: 'Foo' }, bar: { eq: 'Bar' } }] });

    expect(res).toEqual({ data: { testFilter: response } });
  });

  it('should construct a correct Filter Type from a GraphQL Interface Type', async () => {

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
          testFilter: {
            type: TestInterfaceType,
            args: {
              filters: { type: FilterType(TestInterfaceType) }
            }
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server.query(`
      query testFilter($filters: [FilterTestInterfaceType]) {
        testFilter(filters: $filters) {
          foo,
          bar
        }
      }
    `, { filters: [{ foo: { eq: 'Foo' }, bar: { eq: 'Bar' } }] });

    expect(res).toEqual({ data: { testFilter: response } });
  });
});
