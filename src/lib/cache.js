import { promisify } from 'util';
import redis from 'redis';

const client = redis.createClient('redis://cache');

const get = promisify(client.get).bind(client);
const set = promisify(client.set).bind(client);
const hset = promisify(client.hset).bind(client);
const hget = promisify(client.hget).bind(client);
const del = promisify(client.del).bind(client);
const hdel = promisify(client.hdel).bind(client);

export default {
  get,
  set,
  hset,
  hget,
  del,
  hdel,
};
