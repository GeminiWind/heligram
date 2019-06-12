import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

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


storageLibrary.pre('save', function save(next) {
  const now = moment().unix();

  this.Attributes = this.Attributes ? this.Attributes : {};

  this.Attributes.updatedAt = now;

  if (!this.Attributes.createdAt) {
    this.Attributes.createdAt = now;
  }

  next();
});

export default mongoose.model('Record', storageLibrary);
