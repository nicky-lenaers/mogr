import { Connection, Document, Model, Schema } from 'mongoose';

export function getParentModel(connection: Connection, child: Model<Document>) {

  const name = 'ParentModel';
  if (connection.modelNames().includes(name)) return connection.model(name);

  const ParentSchema = new Schema({
    child: {
      type: Schema.Types.ObjectId,
      ref: child.modelName
    }
  });

  return connection.model('ParentModel', ParentSchema);
}
