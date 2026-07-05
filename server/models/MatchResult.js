import mongoose from 'mongoose';

const matchResultSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  filename: {
    type: String,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  matchScore: {
    type: Number,
    required: true,
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  missingSkills: {
    type: [String],
    default: [],
  },
  resumeWordCount: {
    type: Number,
    default: 0,
  },
  topKeywords: [
    {
      keyword: String,
      jd_score: Number,
      resume_score: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('MatchResult', matchResultSchema);
