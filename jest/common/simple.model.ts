import { Connection, Schema } from 'mongoose';

export function getSimpleModel(connection: Connection) {

  const name = 'SimpleModel';
  if (connection.modelNames().includes(name)) return connection.model(name);

  const SimpleSchema = new Schema({
    foo: {
      type: String
    },
    bar: {
      type: String
    }
  });

  return connection.model(name, SimpleSchema);
}
