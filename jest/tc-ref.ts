import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection } from 'mongoose';
import { getParentModel } from './common/parent.model';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';
import { TestCase } from './tc';

interface RefTestCase extends TestCase {
  parentModelName: string;
  childModelName: string;
}

/**
 * A Ref Test Case.
 *
 * @param connection        Mongoose Connection
 * @returns                 Test Case
 */
export function refCase(connection: Connection): RefTestCase {

  const simpleModel = getSimpleModel(connection);
  const childModelName = simpleModel.modelName;
  const model = getParentModel(connection, simpleModel);
  const parentModelName = model.modelName;

  const response = {
    child: { ...simpleResponse }
  };

  const RefType: GraphQLObjectType = new GraphQLObjectType({
    name: 'RefType',
    fields: () => ({
      child: {
        type: SimpleType
      }
    })
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RefQueries',
      fields: () => ({
        ref: {
          type: RefType,
          resolve: () => response
        }
      })
    })
  });

  return {
    model,
    response,
    schema,
    parentModelName,
    childModelName
  };
}
