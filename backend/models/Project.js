const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Add index for faster queries
projectSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
