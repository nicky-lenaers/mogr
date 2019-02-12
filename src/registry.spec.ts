import { Connection, createConnection } from 'mongoose';
import { Registry } from './registry';

const connection: Connection = createConnection();

it('should be able to create a Registry', () => {

  const registry = new Registry(connection);

  expect(registry).toBeTruthy();
});
