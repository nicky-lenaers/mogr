import { Connection, createConnection } from 'mongoose';
import { Registry } from './registry';
import { mockServer, IMockServer } from 'graphql-tools';
import { GraphQLSchema, GraphQLObjectType, GraphQLFieldConfig, GraphQLString } from 'graphql';

const connection: Connection = createConnection();

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'UserType',
  fields: {
    username: {
      type: GraphQLString
    }
  }
});

const queryUser: GraphQLFieldConfig<object, any> = {
  type: UserType,
  resolve: () => { }
}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'UserQueries',
    fields: {
      queryUser
    }
  })
});

describe('registry', () => {

  let server: IMockServer;

  beforeAll(() => {
    server = mockServer(schema, {
      Int: () => 65,
      String: () => 'John Doe'
    });
  });

  it('should be able to create', () => {

    const registry = new Registry(connection);

    expect(registry).toBeTruthy();
  });

  it('should have a working mockserver', async () => {
    const res = await server.query(`{ __schema { types { name } } }`);
    console.log('RES: ', res);
    expect(res).toBeTruthy();
  });
})
