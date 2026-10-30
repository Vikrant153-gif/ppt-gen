const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, default: '' },
  alt: { type: String, default: '' },
  photographerName: { type: String, default: '' },
  photographerUrl: { type: String, default: '' },
  isFallback: { type: Boolean, default: false },
}, { _id: false });

const slideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  layout: { type: String, default: 'standard' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  content: { type: [String], default: [] },
  theme: { type: String, default: 'default' },
  unsplashQuery: { type: String, default: '' },
  image: { type: imageSchema, default: null },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  slides: {
    type: [slideSchema],
    default: [],
  },
}, {
  timestamps: true, // auto createdAt & updatedAt
});

// Virtual 'id' that maps _id to a string for frontend compatibility
projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Project', projectSchema);
