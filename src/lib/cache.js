import { promisify } from 'util';
import redis from 'redis';

const client = redis.createClient('redis://cache');

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);

export {
  get,
  set,
};
