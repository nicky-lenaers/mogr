import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLSchema } from 'graphql';
import { PageArgsMap } from './page-args';
import { mockServer } from 'graphql-tools';

describe('PageArgsMap', () => {

  it('should construct a correct GraphQL Field Config Argument Map', async () => {

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
          testPageArgsMap: {
            type: TestType,
            args: PageArgsMap(TestType)
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server
      .query(`
        query testPageArgsMap($filters: [FilterTestType], $queryOptions: QueryOptionsTestType) {
          testPageArgsMap(filters: $filters, queryOptions: $queryOptions) {
            foo,
            bar
          }
        }
      `, {
          filters: [
            { foo: { eq: 'Foo' } },
            { bar: { ne: 'Bar' } }
          ],
          queryOptions: {
            orderBy: [
              { field: 'foo', direction: 'ASC' },
              { field: 'bar', direction: 'DESC' }
            ]
          }
        }
      );

    expect(res).toEqual({ data: { testPageArgsMap: response } });
  });
});
