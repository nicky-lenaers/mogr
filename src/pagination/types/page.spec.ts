import { GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { mockServer } from 'graphql-tools';
import { Types } from 'mongoose';
import { Page } from '../query-page';
import { base64Encode } from '../utils';
import { PageType, EdgeType } from './page';

describe('PageType', () => {

  it('should construct a correct GraphQL Object Type', async () => {

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
          testPage: {
            type: PageType(TestType)
          }
        })
      })
    });

    const cursor = base64Encode(Types.ObjectId().toHexString());
    const response: Page<any> = {
      totalCount: 1,
      edges: [{
        cursor,
        node: {
          foo: 'Foo',
          bar: 'Bar'
        }
      }],
      pageInfo: {
        startCursor: cursor,
        endCursor: cursor,
        hasPrevPage: false,
        hasNextPage: false
      }
    };

    const server = mockServer(schema, { PaginatedTestType: () => response });

    const res = await server.query(`
      query testPage {
        testPage {
          totalCount,
          edges {
            cursor,
            node {
              foo,
              bar
            }
          },
          pageInfo {
            startCursor,
            endCursor,
            hasPrevPage,
            hasNextPage
          }
        }
      }
    `);

    expect(res).toEqual({ data: { testPage: response } });
  });

  it('should set the name of PageType from given options', async () => {

    const customName = 'CustomPageTypeName';

    const TestType = new GraphQLObjectType({
      name: 'TestType',
      fields: () => ({
        foo: { type: GraphQLString }
      })
    });

    const CustomPageType = PageType(TestType, {
      pageTypeName: customName
    });

    expect(CustomPageType.name).toEqual(customName);
  });

  it('should set the name of EdgeType from given options', async () => {

    const customName = 'CustomEdgeTypeName';

    const TestType = new GraphQLObjectType({
      name: 'TestType',
      fields: () => ({
        foo: { type: GraphQLString }
      })
    });

    const CustomEdgeType = EdgeType(TestType, {
      edgeTypeName: customName
    });

    expect(CustomEdgeType.name).toEqual(customName);
  });
});
