import { GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLSchema } from "graphql";
import { QueryOptionsType } from "./query-options";
import { mockServer } from "graphql-tools";
import { base64Encode } from "../utils";

describe('QueryOptionsType', () => {

  it('should construct a correct GraphQL Input Object Type', async () => {

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
          testQueryOptions: {
            type: TestType,
            args: {
              queryOptions: {
                type: QueryOptionsType(TestType)
              }
            }
          }
        })
      })
    });

    const response = { foo: 'Foo', bar: 'Bar' };
    const server = mockServer(schema, { TestType: () => response });

    const res = await server.query(`
      query testQueryOptions($queryOptions: QueryOptionsTestType) {
        testQueryOptions(queryOptions: $queryOptions) {
          foo,
          bar
        }
      }
    `, {
        queryOptions: {
          orderBy: [
            { field: 'foo', direction: 'ASC' },
            { field: 'bar', direction: 'DESC' }
          ],
          first: 1,
          last: 1,
          before: base64Encode('3'),
          after: base64Encode('1')
        }
      });

    expect(res).toEqual({ data: { testQueryOptions: response } });
  });
});
