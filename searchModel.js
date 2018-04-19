const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const searchSchema = new Schema({
  searchTerm: String,
  date: { type: Date, default: Date.now },
});

// Export model from Schema
module.exports = mongoose.model('SearchModel', searchSchema);
