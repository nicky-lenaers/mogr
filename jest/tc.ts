import { Model, Document } from 'mongoose';
import { GraphQLSchema } from 'graphql';

export interface TestCase {
  model: Model<Document>;
  response: any;
  schema: GraphQLSchema;
}
