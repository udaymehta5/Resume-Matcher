import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
  },
  mimeType: {
    type: String,
  },
  size: {
    type: Number,
  },
  extractedText: {
    type: String,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    default: 'guest',
  },
});

export default mongoose.model('Resume', resumeSchema);
