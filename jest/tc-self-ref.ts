import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { simpleFields } from './common/simple.type';
import { TestCase } from './tc';

interface SelfRefTestCase extends TestCase {
  modelName: string;
}

/**
 * A Self Ref Test Case.
 *
 * @param connection        Connection
 * @returns                 Test Case
 */
export function selfRefCase(connection: Connection): SelfRefTestCase {

  const modelName = 'SelfRefModel';

  const SelfRefSchema = new Schema({
    self: {
      type: Schema.Types.ObjectId,
      ref: modelName
    }
  });

  const simpleModel = getSimpleModel(connection);
  const model = simpleModel.discriminator(modelName, SelfRefSchema);

  const response = {
    ...simpleResponse,
    self: {
      ...simpleResponse
    }
  };

  const SelfRefType = new GraphQLObjectType({
    name: 'SelfRefType',
    fields: () => ({
      ...simpleFields,
      self: {
        type: SelfRefType
      }
    })
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'SelfRefQueries',
      fields: () => ({
        selfRef: {
          type: SelfRefType,
          resolve: () => response
        }
      })
    })
  });

  return {
    model,
    response,
    schema,
    modelName
  }
}
