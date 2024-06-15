const mongoose = require('mongoose');

const setupSchema = new mongoose.Schema({
  car: { type: String, required: true },
  character: { type: String, required: true },
  glider: { type: String, required: true },
  wheel: { type: String, required: true },
  track: { type: String, required: true },
  week: { type: Date, default: Date.now }
});

setupSchema.pre('save', function(next) {
  console.log('Saving new weekly setup:', this);
  next();
});

setupSchema.post('save', function(doc, next) {
  console.log('Weekly setup saved successfully:', doc);
  next();
});

setupSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving weekly setup:', error.message, error.stack);
    next(error);
  } else {
    next();
  }
});

const Setup = mongoose.model('Setup', setupSchema);

module.exports = Setup;