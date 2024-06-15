const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  allowNewSignups: { type: Boolean, required: true, default: true }
});

appSettingsSchema.pre('save', function(next) {
  console.log('Saving app settings:', this);
  next();
});

appSettingsSchema.post('save', function(doc) {
  console.log('App settings saved:', doc);
});

appSettingsSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving app settings:', error.message, error.stack);
    next(error);
  } else {
    next();
  }
});

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

module.exports = AppSettings;