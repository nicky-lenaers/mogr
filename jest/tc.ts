import { GraphQLSchema } from 'graphql';
import { Document, Model } from 'mongoose';

export interface TestCase {
  model: Model<Document>;
  response: any;
  schema: GraphQLSchema;
}
