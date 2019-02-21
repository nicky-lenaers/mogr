import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Connection, Schema } from 'mongoose';
import { getParentModel } from './common/parent.model';
import { getSimpleModel } from './common/simple.model';
import { simpleResponse } from './common/simple.response';
import { SimpleType } from './common/simple.type';

export function refSelected(connection: Connection) {

  const modelName = 'RefSelectedModel';

  const RefSelectedChildSchema = new Schema({
    baz: {
      type: Schema.Types.String,
      select: true
    }
  });

  const simpleModel = getSimpleModel(connection);
  const refSelectedModel = simpleModel.discriminator(modelName, RefSelectedChildSchema);

  const model = getParentModel(connection, refSelectedModel);

  const response = {
    child: { ...simpleResponse }
  };

  const RefType: GraphQLObjectType = new GraphQLObjectType({
    name: 'RefSelectedType',
    fields: () => ({
      child: {
        type: SimpleType
      }
    })
  });

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'RefSelectedQueries',
      fields: () => ({
        refSelected: {
          type: RefType,
          resolve: () => response
        }
      })
    })
  });

  return {
    model,
    response,
    schema
  };
}
