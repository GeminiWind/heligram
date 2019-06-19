import mongoose, { Schema } from 'mongoose';
import moment from 'moment';
import cache from './cache';

const storageLibrary = new Schema({
  Path: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  Attributes: {
    type: Object,
  },
  Content: {
    type: Object,
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
});

// cache mechanism
const { exec } = mongoose.Query.prototype;

mongoose.Query.prototype.cache = function config(option = {}) {
  this.cache = true;
  this.hKey = option.hKey || '';

  return this;
};

mongoose.Query.prototype.exec = async function doCache(...args) {
  if (!this.cache) {
    return exec.apply(this, args);
  }

  const key = JSON.stringify(this.getQuery());
  const cacheValue = await cache.hget(this.hKey, key);

  if (cacheValue) {
    if (Array.isArray(cacheValue)) {
      return cacheValue.map(record => this.model(JSON.parse(record)));
    }

    return this.model(JSON.parse(cacheValue));
  }

  const result = await exec.apply(this, args);

  await cache.hset(this.hKey, key, JSON.stringify(result));

  return result;
};

storageLibrary.pre('save', function save(next) {
  const now = moment().unix();

  this.Attributes = this.Attributes ? this.Attributes : {};

  this.Attributes.updatedAt = now;

  if (!this.Attributes.createdAt) {
    this.Attributes.createdAt = now;
  }

  next();
});

storageLibrary.post('remove', async function remove(next) {
  await cache.del(this.Path);

  next();
});

export default mongoose.model('Record', storageLibrary);
